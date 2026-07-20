param([int]$Port = 8091)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))

$serverSource = @'
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Sockets;
using System.Text;
using System.Threading;

public static class VerdeonStaticServer
{
    private static readonly Dictionary<string, string> Mime = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        { ".html", "text/html; charset=utf-8" }, { ".css", "text/css; charset=utf-8" },
        { ".js", "text/javascript; charset=utf-8" }, { ".json", "application/json; charset=utf-8" },
        { ".svg", "image/svg+xml" }, { ".webp", "image/webp" }, { ".png", "image/png" },
        { ".jpg", "image/jpeg" }, { ".jpeg", "image/jpeg" }, { ".woff2", "font/woff2" },
        { ".xml", "application/xml; charset=utf-8" }, { ".txt", "text/plain; charset=utf-8" },
        { ".webmanifest", "application/manifest+json" }
    };

    public static void Queue(TcpClient client, string root)
    {
        ThreadPool.QueueUserWorkItem(_ => Handle(client, root));
    }

    private static void Handle(TcpClient client, string root)
    {
        using (client)
        {
            NetworkStream stream = client.GetStream();
            var request = new List<byte>();
            int marker = 0;
            while (request.Count < 16384)
            {
                int value = stream.ReadByte();
                if (value < 0) return;
                request.Add((byte)value);
                marker = value == (marker == 0 || marker == 2 ? 13 : 10) ? marker + 1 : (value == 13 ? 1 : 0);
                if (marker == 4) break;
            }

            string firstLine = Encoding.ASCII.GetString(request.ToArray()).Split(new[] { "\r\n" }, StringSplitOptions.None)[0];
            string[] parts = firstLine.Split(' ');
            if (parts.Length < 2) return;
            string method = parts[0];
            string requestPath = Uri.UnescapeDataString(parts[1].Split('?')[0]);
            if (requestPath == "/") requestPath = "/index.html";
            string relative = requestPath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            string candidate = Path.GetFullPath(Path.Combine(root, relative));
            string safeRoot = root.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            string status = "200 OK";

            if (!candidate.StartsWith(safeRoot, StringComparison.OrdinalIgnoreCase) || !File.Exists(candidate))
            {
                candidate = Path.Combine(root, "404.html");
                status = "404 Not Found";
            }

            byte[] body = File.ReadAllBytes(candidate);
            string extension = Path.GetExtension(candidate);
            string contentType;
            if (!Mime.TryGetValue(extension, out contentType)) contentType = "application/octet-stream";
            string headers = "HTTP/1.1 " + status + "\r\nContent-Type: " + contentType
                + "\r\nContent-Length: " + body.Length + "\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n";
            byte[] headerBytes = Encoding.ASCII.GetBytes(headers);
            stream.Write(headerBytes, 0, headerBytes.Length);
            if (method == "GET") stream.Write(body, 0, body.Length);
            stream.Flush();
        }
    }
}
'@

Add-Type -TypeDefinition $serverSource
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "Serving $root at http://127.0.0.1:$Port/"

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        [VerdeonStaticServer]::Queue($client, $root)
    }
} finally {
    $listener.Stop()
}

param([string]$Path)
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WR {
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int cmd);
}
"@
$p = Get-Process 随记,electron -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $p) { Write-Output "NOWINDOW"; exit 1 }
[WR]::ShowWindow($p.MainWindowHandle, 9) | Out-Null
Start-Sleep -Seconds 2
Write-Output "restored"

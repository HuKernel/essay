Add-Type @"
using System;
using System.Runtime.InteropServices;
public class EC {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, UIntPtr extra);
  public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
Add-Type -AssemblyName System.Windows.Forms
$p = Get-Process 随记,electron -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $p) { Write-Output "NOWINDOW"; exit 1 }
[EC]::SetForegroundWindow($p.MainWindowHandle) | Out-Null
Start-Sleep -Milliseconds 600
$r = New-Object EC+RECT
[EC]::GetWindowRect($p.MainWindowHandle, [ref]$r) | Out-Null
$x = $r.Left + 600
$y = $r.Top + 300
[EC]::SetCursorPos($x, $y) | Out-Null
Start-Sleep -Milliseconds 200
[EC]::mouse_event(2, 0, 0, 0, [UIntPtr]::Zero)
[EC]::mouse_event(4, 0, 0, 0, [UIntPtr]::Zero)
Start-Sleep -Milliseconds 700
[System.Windows.Forms.SendKeys]::SendWait("/")
Write-Output "clicked-editor-and-slash at $x,$y"

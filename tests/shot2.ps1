param([string]$Path)
Add-Type @"
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public class WinEnum {
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc cb, IntPtr lp);
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lp);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hWnd, IntPtr hdc, uint flags);
  public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
Add-Type -AssemblyName System.Drawing
$targets = Get-Process electron -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id
$found = New-Object System.Collections.ArrayList
$cb = [WinEnum+EnumWindowsProc]{
  param($hWnd, $lp)
  $pid2 = 0
  [WinEnum]::GetWindowThreadProcessId($hWnd, [ref]$pid2) | Out-Null
  if ($targets -contains [int]$pid2 -and [WinEnum]::IsWindowVisible($hWnd)) {
    $r = New-Object WinEnum+RECT
    [WinEnum]::GetWindowRect($hWnd, [ref]$r) | Out-Null
    $w = $r.Right - $r.Left; $h = $r.Bottom - $r.Top
    if ($w -gt 500 -and $h -gt 300) { [void]$found.Add(@{H=$hWnd; W=$w; Ht=$h}) }
  }
  return $true
}
[WinEnum]::EnumWindows($cb, [IntPtr]::Zero) | Out-Null
if ($found.Count -eq 0) { Write-Output "NOWINDOW"; exit 1 }
$best = $found | Sort-Object { $_.W * $_.Ht } -Descending | Select-Object -First 1
$bmp = New-Object System.Drawing.Bitmap $best.W, $best.Ht
$g = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $g.GetHdc()
[WinEnum]::PrintWindow($best.H, $hdc, 2) | Out-Null
$g.ReleaseHdc($hdc)
$bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "saved:$Path $($best.W)x$($best.Ht)"

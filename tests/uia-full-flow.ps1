Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms
function Get-Win {
  $p = Get-Process electron,随记 -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if (-not $p) { throw "NOWINDOW" }
  return [System.Windows.Automation.AutomationElement]::FromHandle($p.MainWindowHandle)
}
function Find-Buttons($parent, $needle) {
  $cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::Button)
  $result = @()
  foreach ($b in $parent.FindAll([System.Windows.Automation.TreeScope]::Descendants, $cond)) {
    if ($b.Current.Name -like "*$needle*") { $result += $b }
  }
  return $result
}
function Click-When($needle, $maxTries, $delayMs) {
  for ($i = 0; $i -lt $maxTries; $i++) {
    $win = Get-Win
    $items = Find-Buttons $win $needle
    if ($items.Count -gt 0) {
      try {
        $items[0].GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
        return $true
      } catch {}
    }
    Start-Sleep -Milliseconds $delayMs
  }
  return $false
}
function Bring-Front {
  $p = Get-Process electron,随记 -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if ($p) {
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public class FK {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
}
"@
    [FK]::SetForegroundWindow($p.MainWindowHandle) | Out-Null
  }
}
Bring-Front
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("/")
$r1 = Click-When "插入其它笔记的块引用卡片" 8 400
Start-Sleep -Milliseconds 500
$r2 = Click-When "wsl2" 6 400
Start-Sleep -Milliseconds 500
$r3 = Click-When "注意:如果有提示" 6 400
Start-Sleep -Milliseconds 800
$r4 = Click-When "注意:如果有提示" 6 400
Start-Sleep -Milliseconds 600
Write-Output "menu=$r1 note=$r2 block=$r3 card=$r4"

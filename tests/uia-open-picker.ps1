param([string]$Needle, [string]$Confirm)
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
# 先确保前台
$p = Get-Process electron,随记 -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if ($p) { [System.Windows.Forms.SendKeys]::SendWait("/") ; Start-Sleep -Milliseconds 900 }
$win = Get-Win
$clicked = $false
for ($i = 0; $i -lt 6; $i++) {
  $win = Get-Win
  $items = Find-Buttons $win $Needle
  if ($items.Count -gt 0) {
    foreach ($item in $items) {
      try { $item.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke(); $clicked = $true; break } catch {}
    }
    break
  }
  # 菜单没出现：重新补一个 /
  [System.Windows.Forms.SendKeys]::SendWait("{BACKSPACE}")
  Start-Sleep -Milliseconds 200
  [System.Windows.Forms.SendKeys]::SendWait("/")
  Start-Sleep -Milliseconds 900
}
Start-Sleep -Milliseconds 800
$win = Get-Win
$ok = $false
for ($i = 0; $i -lt 4; $i++) {
  $conf = Find-Buttons $win $Confirm
  if ($conf.Count -gt 0) { $ok = $true; break }
  Start-Sleep -Milliseconds 600
  $win = Get-Win
}
Write-Output "clicked=$clicked confirm=$ok"

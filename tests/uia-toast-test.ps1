Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
function Get-Win {
  $p = Get-Process electron -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if (-not $p) { throw "NOWINDOW" }
  return [System.Windows.Automation.AutomationElement]::FromHandle($p.MainWindowHandle)
}
function Find-ByName($parent, $name) {
  $cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, $name)
  return $parent.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $cond)
}
function Count-Named($parent, $name) {
  $cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, $name)
  return $parent.FindAll([System.Windows.Automation.TreeScope]::Descendants, $cond).Count
}
$win = Get-Win
$before = (Count-Named $win "移到回收站")
$del = Find-ByName $win "移到回收站"
$del.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
Start-Sleep -Milliseconds 900
$win = Get-Win
$during = (Count-Named $win "移到回收站")
$undo = Find-ByName $win "撤销"
$toastFound = ($null -ne $undo)
if ($undo) {
  $undo.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
  Start-Sleep -Milliseconds 800
}
$win = Get-Win
$after = (Count-Named $win "移到回收站")
Write-Output "before=$before during=$during toast=$toastFound after=$after"

Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$p = Get-Process electron,随记 -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $p) { Write-Output "NOWINDOW"; exit 1 }
$root = [System.Windows.Automation.AutomationElement]::FromHandle($p.MainWindowHandle)
$cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::Button)
$buttons = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $cond)
foreach ($b in $buttons) {
  $r = $b.Current.BoundingRectangle
  $name = $b.Current.Name
  if ($name -ne $null -and $name -ne "") { Write-Output "BTN [$($r.X),$($r.Y) $($r.Width)x$($r.Height)] $name" }
}
$edits = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::Edit)))
foreach ($e in $edits) {
  $r = $e.Current.BoundingRectangle
  Write-Output "EDIT [$($r.X),$($r.Y) $($r.Width)x$($r.Height)] value=[$($e.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern).Current.Value)]"
}

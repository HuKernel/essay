Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$p = Get-Process 随记,electron -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $p) { Write-Output "NOWINDOW"; exit 1 }
$root = [System.Windows.Automation.AutomationElement]::FromHandle($p.MainWindowHandle)
$cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::Edit)
$edits = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $cond)
$i = 0
foreach ($e in $edits) {
  $v = ""
  try { $v = $e.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern).Current.Value } catch {}
  Write-Output "EDIT[$i] name=[$($e.Current.Name)] value=[$v]"
  $i += 1
}

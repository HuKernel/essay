param([string]$Name)
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$p = Get-Process 随记,electron -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $p) { Write-Output "NOWINDOW"; exit 1 }
$root = [System.Windows.Automation.AutomationElement]::FromHandle($p.MainWindowHandle)
$cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, $Name)
$el = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $cond)
if (-not $el) { Write-Output "NOTFOUND:$Name"; exit 1 }
$inv = $el.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
$inv.Invoke()
Write-Output "CLICKED:$Name"

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
$win = Get-Win
$meta = Find-ByName $win "编辑属性"
if (-not $meta) { Write-Output "NO-META-BUTTON"; exit 1 }
$meta.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
Start-Sleep -Milliseconds 600
$win = Get-Win
$emojiInput = Find-ByName $win "图标 emoji"
if (-not $emojiInput) { Write-Output "NO-EMOJI-INPUT"; exit 1 }
$valuePattern = $emojiInput.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
$valuePattern.SetValue("🚀")
Start-Sleep -Milliseconds 800
$win = Get-Win
$badge = Find-ByName $win "🚀"
if ($badge) { Write-Output "EMOJI-BADGE-OK" } else { Write-Output "BADGE-NOT-FOUND" }
$save = Find-ByName $win "已保存"
Start-Sleep -Milliseconds 600

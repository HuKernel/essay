Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms
function Get-Win {
  $p = Get-Process 随记,electron -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if (-not $p) { throw "NOWINDOW" }
  return [System.Windows.Automation.AutomationElement]::FromHandle($p.MainWindowHandle)
}
function Find-ByName($parent, $name) {
  $cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, $name)
  return $parent.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $cond)
}
$win = Get-Win
$emojiInput = Find-ByName $win "笔记图标（粘贴一个 emoji）"
if (-not $emojiInput) { Write-Output "NO-EMOJI-INPUT"; exit 1 }
Set-Clipboard -Value "🚀"
$emojiInput.SetFocus()
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Milliseconds 1500
$win = Get-Win
$badge = Find-ByName $win "🚀"
if ($badge) { Write-Output "EMOJI-BADGE-OK" } else { Write-Output "BADGE-NOT-FOUND" }

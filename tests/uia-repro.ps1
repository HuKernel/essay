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
function Invoke-El($el) {
  $el.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
}
$win = Get-Win
# 切到文件模式
try {
  $fileBtn = Find-Buttons $win "文件"
  if ($fileBtn.Count -gt 0) { Invoke-El $fileBtn[0]; Start-Sleep -Seconds 1 }
} catch {}
$win = Get-Win
# 点第一篇未命名记录（含引用卡）
$items = Find-Buttons $win "未命名记录"
Write-Output "note-items=$($items.Count)"
if ($items.Count -eq 0) { exit 1 }
Invoke-El $items[0]
Start-Sleep -Seconds 2
$win = Get-Win
$cards = Find-Buttons $win "注意:如果有提示"
Write-Output "cards-found=$($cards.Count)"
if ($cards.Count -eq 0) {
  # 试第二篇
  $win = Get-Win
  $items = Find-Buttons $win "未命名记录"
  if ($items.Count -gt 1) {
    Invoke-El $items[1]
    Start-Sleep -Seconds 2
    $win = Get-Win
    $cards = Find-Buttons $win "注意:如果有提示"
    Write-Output "second-note cards=$($cards.Count)"
  }
  if ($cards.Count -eq 0) { Write-Output "NO-CARD"; exit 1 }
}
$win = Get-Win
$cards = Find-Buttons $win "注意:如果有提示"
Invoke-El $cards[0]
Write-Output "card-clicked"
Start-Sleep -Seconds 2

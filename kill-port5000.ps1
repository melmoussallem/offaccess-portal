# Find the PID using port 5000
$processId = netstat -ano | Select-String ":5000" | ForEach-Object {
    ($_ -split "\s+")[-1]
} | Select-Object -First 1

if ($processId) {
    Write-Host "Killing Node process with PID $processId on port 5000..."
    taskkill /F /PID $processId
} else {
    Write-Host "No process found using port 5000."
} 
# specify the path to the folder you want to monitor:
$Path = 'D:\test-file-watcher'

# specify which files you want to monitor
$FileFilter = '*'  

# specify whether you want to monitor subfolders as well:
$IncludeSubfolders = $true

# specify the file or folder properties you want to monitor:
$AttributeFilter = [IO.NotifyFilters]::FileName, [IO.NotifyFilters]::LastWrite 

# specify the type of changes you want to monitor:
$ChangeTypes = [System.IO.WatcherChangeTypes]::All

# specify the maximum time (in milliseconds) you want to wait for changes:
$Timeout = 1000

$MaxFfmpegProcess = 4
$CurrentFfmpegProcess = 0
$Added = [System.Collections.ArrayList]::new()

# define a function that gets called for every change:
function Invoke-SomeAction
{
  param
  (
    [Parameter(Mandatory)]
    [System.IO.WaitForChangedResult]
    $ChangeInformation
  )
  
  # Write-Warning 'Change detected:'
  # $ChangeInformation | Out-String | Write-Host -ForegroundColor DarkYellow
  $type = $ChangeInformation.ChangeType
  if ($type -eq "Created") {
    Write-Host ("[" + $ChangeInformation.ChangeType + "] " + $ChangeInformation.Name + " (was " + $ChangeInformation.OldName + ")") -ForegroundColor Green
    $Added.Add($ChangeInformation.Name) | Out-Null
  } elseif ($type -eq "Deleted") {
    if ($Added -contains $ChangeInformation.Name) {
      $Added.Remove($ChangeInformation.Name) | Out-Null
      
    } else {
      Write-Host ("[" + $ChangeInformation.ChangeType + "] " + $ChangeInformation.Name + " (was " + $ChangeInformation.OldName + ")") -ForegroundColor Red
    }
  }
}

# use a try...finally construct to release the
# filesystemwatcher once the loop is aborted
# by pressing CTRL+C
try
{
  Write-Warning "FileSystemWatcher is monitoring $Path"

  # create a filesystemwatcher object
  $watcher = New-Object -TypeName IO.FileSystemWatcher -ArgumentList $Path, $FileFilter -Property @{
    IncludeSubdirectories = $IncludeSubfolders
    NotifyFilter = $AttributeFilter
  }

  # start monitoring manually in a loop:
  do
  {
    # wait for changes for the specified timeout
    # IMPORTANT: while the watcher is active, PowerShell cannot be stopped
    # so it is recommended to use a timeout of 1000ms and repeat the
    # monitoring in a loop. This way, you have the chance to abort the
    # script every second.
    $result = $watcher.WaitForChanged($ChangeTypes, $Timeout)
    # if there was a timeout, continue monitoring:
    if ($result.TimedOut) { continue }
    
    Invoke-SomeAction -Change $result
    # the loop runs forever until you hit CTRL+C    
  } while ($true)
}
finally
{
  # release the watcher and free its memory:
  $watcher.Dispose()
  Write-Warning 'FileSystemWatcher removed.'
}
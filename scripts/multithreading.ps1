$index = 1
$files = Get-ChildItem -Include *.mkv -Recurse -File "E:\Site\Films\Animation\Blue Sky" | % { 
    Return @{
        Id = $index++
        Data = $_
    }
}

# Create a hashtable for process.
# Keys should be ID's of the processes
$origin = @{}
$files | Foreach-Object {$origin.($_.id) = @{}}

# Create synced hashtable
$sync = [System.Collections.Hashtable]::Synchronized($origin)

$job = $files | Foreach-Object -ThrottleLimit 4 -AsJob -Parallel {
    $syncCopy = $using:sync
    $process = $syncCopy.$($PSItem.Id)

    $process.Id = $PSItem.Id
    $process.Activity = "Id $($PSItem.Id) starting"
    $process.Status = "Processing"

    # Fake workload start up that takes x amount of time to complete
    # start-sleep -Milliseconds ($PSItem.wait*5)

    # Process. update activity
    $process.Activity = "Processing $($PSItem.Data.FullName)"
    $process.Status = "Probing the file..."

    $FfprobeFile = [string]::join([environment]::newline, (get-content -path "D:\rachinflix-V2.0.0\scripts\ffprobe.ps1"))
    Invoke-Expression $FfprobeFile

    $probe = Ffprobe -FilePath $PSItem.Data.FullName -OutputPath ($PSItem.Data.DirectoryName + '\___TEST___' + $PSItem.Data.Name)
    $process.Activity = "Processing $($PSItem.Data.FullName) [$($probe[0])]"
    $process.Status = "Transcoding file..."

    $p = (Start-Process -FilePath "C:\ffmpeg\bin\ffmpeg.exe" -ArgumentList $probe[1] -Wait -PassThru -NoNewWindow)
    while (!$p.HasExited) {
        $process.Status = "Transcoding file......"
    }
    If ($p.ExitCode -ne 0) {
        Write-Output $p.StandardError.ReadLineAsync()
        $process.Completed = $true
        Exit
    }

    # Mark process as completed
    $process.Completed = $true
}

while($job.State -eq 'Running')
{
    $sync.Keys | Foreach-Object {
        # If key is not defined, ignore
        if(![string]::IsNullOrEmpty($sync.$_.keys))
        {
            # Create parameter hashtable to splat
            $param = $sync.$_

            # Execute Write-Progress
            Write-Progress @param
        }
    }

    # Wait to refresh to not overload gui
    Start-Sleep -Seconds 0.1
}
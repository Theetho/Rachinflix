# Transforme tous les .mkv en .mkv-h264-aac
$root = "E:\Site\Films"
$current = 0
$total = 1
$includes = @(
"E:\Site\Films\X-Men\05 - Days of Future Past.mkv")

$files = Get-ChildItem -Include *.mkv -Recurse -File $root | ForEach-Object $_ { 
    $included = $false
    foreach ($e in $includes) {
        if ($_.FullName -like $e) {
            $included = $true
        }
    }

    if ($included -eq $true) {
        Return $_
    }
} 
# $files | ForEach-Object $_ {
$Remux = {

    param (
        $Item
    )

    If ($null -eq $Item) {
        Return
    }
    
    $fullname = $Item.FullName
    $name = $Item.Name
    $directory = $Item.DirectoryName
    $newname = $directory + "\___VALID___" + $name
    $channels = (ffprobe.exe -v quiet -select_streams a -show_entries stream=channels -of csv $fullname).Replace("stream,", "")


    $needaudio = $false
    $command = '-hwaccel cuvid -i "' + $fullname + '" -loglevel error -hide_banner -stats -y -gpu 0 -max_muxing_queue_size 9999 '
    $command += "-map 0:v -map -v -map V -c:v copy "

    # Are all the audio aac ?
    If ($channels -contains "6" -or $channels -contains 6) {
        $needaudio = $true
    }

    If ($needaudio -eq $true) {
        $command += "-map 0:a -c:a aac -ac 2 "
    } Else {
        return
    }

    $current += 1
    $command += '-map 0:s? -c:s copy "' + $newname + '"'

    
    Set-Variable -Name MyExe C:\ffmpeg\bin\ffmpeg.exe
    
    $process = (Start-Process -FilePath $MyExe -ArgumentList $command -Wait -PassThru -WindowStyle Maximized)
    If ($process.ExitCode -ne 0) {
        Write-Output $process.StandardError.ReadLineAsync()
        Exit
    }
    
    Remove-Item $fullname
    Rename-Item $newname $fullname

    Return @(((Get-Date -Format "[HH:mm:ss] ") + "`"" + $fullname + "`" converted!"), ((Get-Date -Format "[HH:mm:ss] ") + "Executed command line:`n" + $command))
}
for ($i = 0; $i -lt $files.Count; $i += 4) {
    $Indices = @($i, ($i + 1), ($i + 2), ($i + 3))
    $MaxThreads = 10
    $RunscapePool = [RunspaceFactory ]::CreateRunspacePool(1, $MaxThreads)
    $RunscapePool.Open()
    $Pipelines = foreach($index in $Indices){
        $Pipeline = [powershell]::Create()
        $Pipeline.RunspacePool = $RunscapePool
        $Pipeline.AddScript($Remux) | Out-Null   
        $Pipeline.AddArgument($files[$index]) | Out-Null
        $Pipeline | Add-Member -MemberType NoteProperty -Name 'AsyncResult' -Value $Pipeline.BeginInvoke() -PassThru 
    }
    #obtain results as they come.
    $Results = foreach($Pipeline in $Pipelines){
        $Pipeline.EndInvoke($Pipeline.AsyncResult )
    }
    #cleanup code.
    $Pipelines | % { $_.Dispose()}
    $Pipelines = $null
    if ( $RunscapePool ) { $RunscapePool.Close()}
    #your results

    for ($j = 0; $j -lt $Results.Count; $j += 2) {
        Write-Host ""
        Write-Host $Results[$j] -ForegroundColor Green
        Write-Host $Results[$j + 1]
    }
}
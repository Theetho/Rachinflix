function Ffprobe {
    param (
        [string]$FilePath,
        [string]$OutputPath,
        [bool]$ShowCommand
    )

    $videos = (ffprobe.exe -v quiet -select_streams v -show_entries stream=codec_name -of csv $FilePath).Replace("stream,", "") -split(' ')
    $audios = (ffprobe.exe -v quiet -select_streams a -show_entries stream=codec_name,channels -of csv $FilePath).Replace("stream,", "") -split(' ')
    $line = ""

    $needvideo = $false
    foreach ($video in $videos) {
        $line += "|" + $video + "| "
        if ($video -notcontains "h264" -and $video -notcontains "mjpeg") {
            $needvideo = $true
        }
    }

    $needaudio = $false
    foreach ($audio in $audios) {
        $codec = ($audio -split(','))[0]
        $channels = ($audio -split(','))[1]
        $line += "|" + $codec + "|" + $channels + "| "
        if ($codec -ne "aac") {
            $needaudio = $true
        }
        if ($channels -ne "2") {
            $needaudio = $true
        }
    }

    $command = ""
    if ($needvideo -eq $true) {
        $command += '-i "' + $FilePath + '" -loglevel error -hide_banner -stats -max_muxing_queue_size 9999 -y -map 0:v -map -v -map V -c:v h264 '
    } else {
        $command += '-hwaccel cuvid -i "' + $FilePath + '" -loglevel error -hide_banner -stats -y -gpu 0 -max_muxing_queue_size 9999 -map 0:v -map -v -map V -c:v copy '
    }
    if ($needaudio -eq $true) {
        $command += "-map 0:a -c:a aac -ac 2 "
    } else {
        $command += "-map 0:a -c:a copy "
    }
    $command += '-map 0:s? -c:s copy "' + $OutputPath + '"'

    Write-Host ""
    Write-Host ((Get-Date -Format "[HH:mm:ss]") + ' "' + $FilePath + '"') -ForegroundColor Green
    Write-Host ((Get-Date -Format "[HH:mm:ss]") + " Codecs & Channels: " + $line + "- Needs transcoding: ") -f Yellow -nonewline
    if ($needvideo -or $needaudio) {
        Write-Host "True" -ForegroundColor Cyan
    } else {
        Write-Host "False" -ForegroundColor Red
    }
    if ($ShowCommand) {
        Write-Host ((Get-Date -Format "[HH:mm:ss]") + " Command line to transcode:`n" + $command)
    }

    return @(($needvideo -or $needaudio), $command)
}

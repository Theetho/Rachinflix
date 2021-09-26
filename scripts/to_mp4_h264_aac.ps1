# Transforme tous les .mkv en .mp4-h264-aac
$root = "D:/rachinflix-v2.0.0/server/public/trailers"
$current = 0
$files = Get-ChildItem -Include *.mkv -Recurse -File $root | ForEach-Object $_ { Return $_.FullName } 
$files | ForEach-Object $_ {
    $video = (ffprobe.exe -v quiet -select_streams v -show_entries stream=codec_name -of csv $_).Replace("stream,", "")
    $audio = (ffprobe.exe -v quiet -select_streams a -show_entries stream=codec_name -of csv $_).Replace("stream,", "")
    
    ffmpeg.exe -v quiet -i $_ -c:v $(If($video -eq "h264") {"copy"} Else {"h264"}) -c:a $(If($audio -eq "aac") {"copy"} Else {"aac"}) -f mp4 $_.Replace(".mkv", ".mp4")
    Remove-Item $_

    $current += 1
    Write-Output ('[' + $current.ToString() + ' files done / ' + $files.Length.ToString() + ' total files]')
}
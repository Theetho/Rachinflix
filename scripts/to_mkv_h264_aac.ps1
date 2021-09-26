# Transforme tous les .mkv en .mkv-h264-aac
$root = "E:\Site\Series"
$current = 0
$total = 1
$excludes = @(
"E:\Site\Series\All american\*",
"E:\Site\Series\Baby\*",
"E:\Site\Series\Black Mirror\*",
"E:\Site\Series\Daredevil\*",
"E:\Site\Series\Dark Crystal\*",
"E:\Site\Series\Fais pas ci fais pas ca\*",
"E:\Site\Series\Fear the Walking Dead\*",
"E:\Site\Series\For All Mankind\*",
"E:\Site\Series\Game of Thrones\*",
"E:\Site\Series\Hanna\*",
"E:\Site\Series\His Dark Materials\*",
"E:\Site\Series\HPI\*",
"E:\Site\Series\Imposters\*",
"E:\Site\Series\Loki\*",
"E:\Site\Series\Lupin\*",
"E:\Site\Series\Peaky Blinders\*",
"E:\Site\Series\Prise au piege\*",
"E:\Site\Series\Raised by Wolves\*",
"E:\Site\Series\See\*",
"E:\Site\Series\Sex Education\*",
"E:\Site\Series\Shingeki No Kyogin\*",
"E:\Site\Series\Skam France\*",
"E:\Site\Series\Snowpiercer\*",
"E:\Site\Series\Star Wars - The Old Republic",
"E:\Site\Series\The 100",
"E:\Site\Series\The Bad Batch",
"E:\Site\Series\The Boys",
"E:\Site\Series\The Falcon and the Winter Soldier",
"E:\Site\Series\The Famous Five",
"E:\Site\Series\The Mandalorian",
"E:\Site\Series\The Orville",
"E:\Site\Series\The Walking Dead",
"E:\Site\Series\The Witcher"
)
$files = Get-ChildItem -Include *.mkv -Recurse -File $root | ForEach-Object $_ { 
    $excluded = $false
    foreach ($e in $excludes) {
        if ($_.FullName -like $e) {
            $excluded = $true
        }
    }

    if ($excluded -eq $false) {
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
    
    $FfprobeFile = [string]::join([environment]::newline, (get-content -path "D:\rachinflix-V2.0.0\scripts\ffprobe.ps1"))
    Invoke-Expression $FfprobeFile
    $probe = Ffprobe -FilePath $fullname -OutputPath $newname
    $needtranscoding = $probe[0]
    $command = $probe[1]
    
    If ($needtranscoding -eq $true) {
        $current += 1

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
    $total += 1
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
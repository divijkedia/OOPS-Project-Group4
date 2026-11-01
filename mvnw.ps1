$projectDir = $PSScriptRoot
$env:JAVA_HOME = "$projectDir\.tools\jdk21"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
& "$projectDir\.tools\maven\bin\mvn.cmd" $args

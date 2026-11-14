BEGIN { FS = "\\." }
NF > 1 { print $NF; exit }

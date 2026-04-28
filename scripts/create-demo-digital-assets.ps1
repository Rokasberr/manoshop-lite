$root = "C:\Users\User\Documents\New project\server\digital-downloads"

$targets = @(
  @{
    Path = "posters\calm-home-poster-bundle-guide.pdf"
    Lines = @(
      "Calm Home Poster Bundle",
      "Demo digital download placeholder",
      "Replace with final printable bundle export."
    )
  },
  @{
    Path = "guides\the-atelier-living-room-guide.pdf"
    Lines = @(
      "The Atelier Living Room Guide",
      "Demo digital download placeholder",
      "Replace with the final premium PDF guide."
    )
  },
  @{
    Path = "planners\sunday-reset-ritual-planner.pdf"
    Lines = @(
      "Sunday Reset Ritual Planner",
      "Demo digital download placeholder",
      "Replace with the final planner PDF export."
    )
  },
  @{
    Path = "bundles\home-edit-bundle.pdf"
    Lines = @(
      "Home Edit Bundle",
      "Demo digital download placeholder",
      "Replace with the final bundle PDF or ZIP export."
    )
  },
  @{
    Path = "bundles\calm-living-bundle.pdf"
    Lines = @(
      "Calm Living Bundle",
      "Demo digital download placeholder",
      "Replace with the final bundle PDF or ZIP export."
    )
  }
)

function New-MinimalPdf {
  param(
    [Parameter(Mandatory = $true)]
    [string]$OutputPath,
    [Parameter(Mandatory = $true)]
    [string[]]$Lines
  )

  $contentLines = @(
    "BT",
    "/F1 24 Tf",
    "72 740 Td"
  )

  $first = $true
  foreach ($line in $Lines) {
    $safe = $line.Replace("\", "\\").Replace("(", "\(").Replace(")", "\)")
    if ($first) {
      $contentLines += "($safe) Tj"
      $first = $false
    } else {
      $contentLines += "0 -32 Td"
      $contentLines += "($safe) Tj"
    }
  }

  $contentLines += "ET"
  $streamText = ($contentLines -join "`n") + "`n"
  $streamBytes = [System.Text.Encoding]::ASCII.GetBytes($streamText)

  $objectValues = @(
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  )

  $builder = New-Object System.Text.StringBuilder
  [void]$builder.Append("%PDF-1.4`n")

  $offsets = New-Object System.Collections.Generic.List[int]

  $offsets.Add($builder.Length)
  [void]$builder.Append("1 0 obj`n")
  [void]$builder.Append($objectValues[0] + "`n")
  [void]$builder.Append("endobj`n")

  $offsets.Add($builder.Length)
  [void]$builder.Append("2 0 obj`n")
  [void]$builder.Append($objectValues[1] + "`n")
  [void]$builder.Append("endobj`n")

  $offsets.Add($builder.Length)
  [void]$builder.Append("3 0 obj`n")
  [void]$builder.Append($objectValues[2] + "`n")
  [void]$builder.Append("endobj`n")

  $offsets.Add($builder.Length)
  [void]$builder.Append("4 0 obj`n")
  [void]$builder.Append("<< /Length $($streamBytes.Length) >>`n")
  [void]$builder.Append("stream`n")
  [void]$builder.Append($streamText)
  [void]$builder.Append("endstream`n")
  [void]$builder.Append("endobj`n")

  $offsets.Add($builder.Length)
  [void]$builder.Append("5 0 obj`n")
  [void]$builder.Append($objectValues[3] + "`n")
  [void]$builder.Append("endobj`n")

  $xrefOffset = $builder.Length
  [void]$builder.Append("xref`n")
  [void]$builder.Append("0 6`n")
  [void]$builder.Append("0000000000 65535 f `n")

  foreach ($offset in $offsets) {
    [void]$builder.AppendFormat("{0:0000000000} 00000 n `n", $offset)
  }

  [void]$builder.Append("trailer`n")
  [void]$builder.Append("<< /Size 6 /Root 1 0 R >>`n")
  [void]$builder.Append("startxref`n")
  [void]$builder.Append($xrefOffset)
  [void]$builder.Append("`n%%EOF`n")

  $directory = Split-Path -Parent $OutputPath
  New-Item -ItemType Directory -Force -Path $directory | Out-Null
  [System.IO.File]::WriteAllText($OutputPath, $builder.ToString(), [System.Text.Encoding]::ASCII)
}

foreach ($target in $targets) {
  $fullPath = Join-Path $root $target.Path
  New-MinimalPdf -OutputPath $fullPath -Lines $target.Lines
}

Get-ChildItem -Recurse -File $root | Select-Object FullName, Length

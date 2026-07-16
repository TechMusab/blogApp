param(
    [string]$BaseUrl = "http://localhost:5191",
    [string]$Password = "password123"
)

$ErrorActionPreference = "Stop"

function Invoke-JsonRequest {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Method,

        [Parameter(Mandatory = $true)]
        [string]$Uri,

        [object]$Body = $null,

        [hashtable]$Headers = @{}
    )

    $request = @{
        Method = $Method
        Uri = $Uri
        Headers = $Headers
        TimeoutSec = 15
    }

    if ($null -ne $Body) {
        $request.ContentType = "application/json"
        $request.Body = $Body | ConvertTo-Json
    }

    Invoke-RestMethod @request
}

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw "Assertion failed: $Message"
    }
}

function Assert-HttpStatus {
    param(
        [scriptblock]$Action,
        [int]$ExpectedStatusCode,
        [string]$Message
    )

    try {
        & $Action | Out-Null
        throw "Expected HTTP $ExpectedStatusCode but request succeeded."
    } catch {
        $response = $_.Exception.Response
        if ($null -eq $response) {
            throw
        }

        $actualStatusCode = [int]$response.StatusCode
        Assert-True ($actualStatusCode -eq $ExpectedStatusCode) "$Message Expected $ExpectedStatusCode, got $actualStatusCode."
    }
}

$email = "auth-flow-$([Guid]::NewGuid().ToString("N").Substring(0, 8))@example.com"
$name = "Auth Flow Tester"
$authUrl = "$BaseUrl/api/auth"

Write-Host "Testing auth flow against $BaseUrl"
Write-Host "Using test email $email"

$registerResponse = Invoke-JsonRequest `
    -Method "Post" `
    -Uri "$authUrl/register" `
    -Body @{
        name = $name
        email = $email
        password = $Password
    }

Assert-True ($registerResponse.email -eq $email) "Register should return an OTP challenge for the email."
Assert-True (-not [string]::IsNullOrWhiteSpace($registerResponse.developmentOtp)) "Development register should return the OTP for automated testing."
Write-Host "PASS registration OTP requested"

Assert-HttpStatus `
    -ExpectedStatusCode 400 `
    -Message "Bad OTP should be rejected." `
    -Action {
        Invoke-JsonRequest `
            -Method "Post" `
            -Uri "$authUrl/verify-registration" `
            -Body @{
                email = $email
                otp = "000000"
            }
    }
Write-Host "PASS bad OTP rejected"

$verifyResponse = Invoke-JsonRequest `
    -Method "Post" `
    -Uri "$authUrl/verify-registration" `
    -Body @{
        email = $email
        otp = $registerResponse.developmentOtp
    }

Assert-True (-not [string]::IsNullOrWhiteSpace($verifyResponse.token)) "Verify registration should return a token."
Assert-True ($verifyResponse.user.email -eq $email) "Verify registration should return the created user."
Write-Host "PASS verify registration"

Assert-HttpStatus `
    -ExpectedStatusCode 409 `
    -Message "Duplicate register after verification should be rejected." `
    -Action {
        Invoke-JsonRequest `
            -Method "Post" `
            -Uri "$authUrl/register" `
            -Body @{
                name = $name
                email = $email
                password = $Password
            }
    }
Write-Host "PASS duplicate register rejected"

$loginResponse = Invoke-JsonRequest `
    -Method "Post" `
    -Uri "$authUrl/login" `
    -Body @{
        email = $email
        password = $Password
    }

Assert-True (-not [string]::IsNullOrWhiteSpace($loginResponse.token)) "Login should return a token."
Assert-True ($loginResponse.user.email -eq $email) "Login should return the logged-in user."
Write-Host "PASS login"

Assert-HttpStatus `
    -ExpectedStatusCode 401 `
    -Message "Bad password login should be rejected." `
    -Action {
        Invoke-JsonRequest `
            -Method "Post" `
            -Uri "$authUrl/login" `
            -Body @{
                email = $email
                password = "wrong-password"
            }
    }
Write-Host "PASS bad login rejected"

$meResponse = Invoke-JsonRequest `
    -Method "Get" `
    -Uri "$authUrl/me" `
    -Headers @{
        Authorization = "Bearer $($loginResponse.token)"
    }

Assert-True ($meResponse.email -eq $email) "Me should return the authenticated user."
Write-Host "PASS me"

Write-Host "Auth flow test completed successfully."

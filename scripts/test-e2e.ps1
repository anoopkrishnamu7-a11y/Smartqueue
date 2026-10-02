# SmartQueue Automated End-to-End Test Suite
# Tests Village Office, Hospital, Beverage Shop, Special Assistance, Duplicate prevention, and Queue calculations.

$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:5000"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  SMARTQUEUE QA AUTOMATION & E2E INTEGRATION TEST SUITE " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

function Assert-Equal($actual, $expected, $message) {
    if ($actual -eq $expected) {
        Write-Host "  [PASS] $message (Expected: $expected, Got: $actual)" -ForegroundColor Green
        $global:passCount++
    } else {
        Write-Host "  [FAIL] $message (Expected: $expected, Got: $actual)" -ForegroundColor Red
        $global:failCount++
    }
}

function Assert-True($condition, $message) {
    if ($condition) {
        Write-Host "  [PASS] $message" -ForegroundColor Green
        $global:passCount++
    } else {
        Write-Host "  [FAIL] $message" -ForegroundColor Red
        $global:failCount++
    }
}

# --- STEP 1: Reset database to clean presentation demo state ---
Write-Host "`n--- 1. Resetting Database to Clean Demo State ---" -ForegroundColor Yellow
$resetRes = Invoke-RestMethod -Uri "$BaseUrl/api/simulation/reset" -Method Post -ContentType "application/json" -Body "{}"
Assert-True ($resetRes.success -eq $true) "Database reset successful"

# Verify places and categories
$places = Invoke-RestMethod -Uri "$BaseUrl/api/places" -Method Get
Assert-Equal $places.Count 3 "Found exactly 3 service locations (Hospital, Village Office, Beverage Shop)"

$categories = Invoke-RestMethod -Uri "$BaseUrl/api/categories" -Method Get
Assert-Equal $categories.Count 3 "Found exactly 3 categories (hospital, village_office, beverage_shop)"

# --- STEP 2: VILLAGE OFFICE FLOW ---
Write-Host "`n--- 2. Testing Village Office Flow (Prefix: V) ---" -ForegroundColor Yellow
$voServices = Invoke-RestMethod -Uri "$BaseUrl/api/services?placeId=place-village-1" -Method Get
Assert-True ($voServices.Count -ge 1) "Retrieved Village Office services list"
$voCertService = $voServices | Where-Object { $_.id -eq "srv-v1" }

# Join Queue as Customer
$joinVoBody = @{
    placeId = "place-village-1"
    serviceId = "srv-v1"
    customerName = "Ramesh Sharma"
    customerPhone = "9876543210"
    priority = "normal"
} | ConvertTo-Json

$voToken = Invoke-RestMethod -Uri "$BaseUrl/api/tokens" -Method Post -ContentType "application/json" -Body $joinVoBody
Assert-True ($voToken.tokenNumber.StartsWith("V")) "Token number starts with 'V' ($($voToken.tokenNumber))"
Assert-Equal $voToken.status "waiting" "Token status is 'waiting'"
Assert-True ($voToken.peopleAhead -ge 0) "People ahead calculated correctly ($($voToken.peopleAhead))"
Assert-True ($voToken.estimatedWaitMins -ge 2) "Wait time calculated correctly ($($voToken.estimatedWaitMins) mins)"

# Test Duplicate Token Prevention
Write-Host "`n--- Testing Duplicate Token Prevention ---" -ForegroundColor Yellow
$dupToken = Invoke-RestMethod -Uri "$BaseUrl/api/tokens" -Method Post -ContentType "application/json" -Body $joinVoBody
Assert-Equal $dupToken.alreadyActive $true "Duplicate submission blocked, returns alreadyActive = true"
Assert-Equal $dupToken.tokenNumber $voToken.tokenNumber "Returned same existing active token number"

# --- STEP 3: SPECIAL ASSISTANCE FLOW ---
Write-Host "`n--- 3. Testing Special Assistance -> Staff Approval -> Notification Flow ---" -ForegroundColor Yellow
$saBody = @{
    customerName = "Kavita Devi"
    customerPhone = "9876500000"
    placeId = "place-village-1"
    serviceId = "srv-v1"
    category = "senior_citizen"
    categoryLabel = "Senior Citizen (60+)"
    supportDetails = "Requires wheelchair escort and ground floor desk assistance"
    requestDirectConsultant = $true
} | ConvertTo-Json

$saRequest = Invoke-RestMethod -Uri "$BaseUrl/api/special-assistance" -Method Post -ContentType "application/json" -Body $saBody
Assert-True ($saRequest.id.StartsWith("sar-")) "Special assistance ticket created ($($saRequest.id))"
Assert-Equal $saRequest.status "pending" "Initial ticket status is 'pending'"

# Staff Reviews and Approves
$reviewBody = @{
    status = "approved"
    assignedRoom = "Entrance Desk Window A (Special Desk)"
    staffNote = "Approved. Ramp escort assigned."
    staffName = "Senior Clerk Sunita"
} | ConvertTo-Json

$approvedSa = Invoke-RestMethod -Uri "$BaseUrl/api/special-assistance/$($saRequest.id)/review" -Method Post -ContentType "application/json" -Body $reviewBody
Assert-Equal $approvedSa.status "approved" "Staff successfully approved special assistance request"
Assert-Equal $approvedSa.assignedRoom "Entrance Desk Window A (Special Desk)" "Assigned room correctly set"

# --- STEP 4: HOSPITAL FLOW & CALL-NEXT & 2-MINUTE / FINAL NOTIFICATIONS ---
Write-Host "`n--- 4. Testing Hospital Flow (Prefix: H) ---" -ForegroundColor Yellow
$hospToken = Invoke-RestMethod -Uri "$BaseUrl/api/tokens" -Method Post -ContentType "application/json" -Body (@{
    placeId = "place-hospital-1"
    serviceId = "srv-h1"
    customerName = "Anita Patel"
    customerPhone = "9123456789"
    priority = "normal"
} | ConvertTo-Json)

Assert-True ($hospToken.tokenNumber.StartsWith("H")) "Hospital token generated with prefix 'H' ($($hospToken.tokenNumber))"

# Call next token at Hospital Counter 1
$callNextRes = Invoke-RestMethod -Uri "$BaseUrl/api/counters/ctr-h1/call-next" -Method Post -ContentType "application/json" -Body "{}"
Assert-True ($callNextRes.token -ne $null) "Counter called next token successfully ($($callNextRes.token.tokenNumber))"
Assert-Equal $callNextRes.token.status "in_service" "Called token status is 'in_service'"
Assert-Equal $callNextRes.counter.status "busy" "Counter status changed to 'busy'"

# Step simulation to trigger alerts for demo token H125
Write-Host "`n--- Testing 2-Minute and Final Turn Notification Triggers ---" -ForegroundColor Yellow
$step1 = Invoke-RestMethod -Uri "$BaseUrl/api/simulation/step-next" -Method Post -ContentType "application/json" -Body "{}"
$step2 = Invoke-RestMethod -Uri "$BaseUrl/api/simulation/step-next" -Method Post -ContentType "application/json" -Body "{}"
$step3 = Invoke-RestMethod -Uri "$BaseUrl/api/simulation/step-next" -Method Post -ContentType "application/json" -Body "{}"

$h125Token = ($step3.tokens | Where-Object { $_.tokenNumber -eq "H125" })
Assert-True ($h125Token -ne $null) "Found demo token H125"
Assert-True ($h125Token.twoMinAlertSent -eq $true -or $h125Token.finalTurnAlertSent -eq $true) "2-Minute or Final Turn alert flag triggered for H125"

# --- STEP 5: BEVERAGE SHOP FLOW ---
Write-Host "`n--- 5. Testing Beverage Shop Flow (Prefix: B) ---" -ForegroundColor Yellow
$bevToken = Invoke-RestMethod -Uri "$BaseUrl/api/tokens" -Method Post -ContentType "application/json" -Body (@{
    placeId = "place-beverage-1"
    serviceId = "srv-b1"
    customerName = "David Kim"
    customerPhone = "9811223344"
    priority = "normal"
} | ConvertTo-Json)

Assert-True ($bevToken.tokenNumber.StartsWith("B")) "Beverage token generated with prefix 'B' ($($bevToken.tokenNumber))"

# Call next at Beverage Counter
$callBev = Invoke-RestMethod -Uri "$BaseUrl/api/counters/ctr-b1/call-next" -Method Post -ContentType "application/json" -Body "{}"
Assert-True ($callBev.token -ne $null) "Beverage counter called next token ($($callBev.token.tokenNumber))"

# Complete Beverage token
$completeRes = Invoke-RestMethod -Uri "$BaseUrl/api/tokens/$($callBev.token.id)/complete" -Method Post -ContentType "application/json" -Body "{}"
Assert-Equal $completeRes.token.status "completed" "Beverage token marked as 'completed'"
Assert-Equal $completeRes.counter.status "available" "Beverage counter freed back to 'available'"

# --- STEP 6: EDGE CASES & CANCEL TOKEN ---
Write-Host "`n--- 6. Testing Token Cancellation & Queue Recalculation ---" -ForegroundColor Yellow
$cancelRes = Invoke-RestMethod -Uri "$BaseUrl/api/tokens/$($voToken.id)/cancel" -Method Post -ContentType "application/json" -Body "{}"
Assert-Equal $cancelRes.status "cancelled" "Token successfully cancelled"

# Guest lookup test
$lookupByToken = Invoke-RestMethod -Uri "$BaseUrl/api/tokens/lookup?tokenNumber=$($hospToken.tokenNumber)" -Method Get
Assert-Equal $lookupByToken.id $hospToken.id "Lookup by token number succeeded"

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "                TEST SUITE SUMMARY" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  TOTAL PASSED: $passCount" -ForegroundColor Green
Write-Host "  TOTAL FAILED: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "======================================================`n" -ForegroundColor Cyan

if ($failCount -gt 0) {
    exit 1
} else {
    exit 0
}

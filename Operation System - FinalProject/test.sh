#!/bin/bash

# Exit on any error for build, but not for tests
# set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[TEST]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}[PASS]${NC} $2"
    else
        echo -e "${RED}[FAIL]${NC} $2"
        return 1
    fi
}

# Build the project first
print_status "Building project..."
./build.sh || {
    print_error "Build failed!"
    exit 1
}

print_status "Running monitor test..."
./output/monitor_test || {
    print_error "Monitor test failed!"
    exit 1
}

print_status "Running consumer producer test..."
./output/consumer_producer_test || {
    print_error "Consumer producer test failed!"
    exit 1
}

print_status "Starting comprehensive tests..."

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test 1a: Invalid arguments
print_status "Test 1a: Invalid arguments"
./output/analyzer  > /dev/null 2>&1
if [ $? -ne 1 ]; then
    print_test_result 1 "Test 1 FAILED: Should return exit code 1 for no arguments"
    ((TESTS_FAILED++))
else
    print_test_result 0 "Invalid arguments handled correctly"
    ((TESTS_PASSED++))
fi


# Test 1b: Invalid arguments
print_status "Test 1b: Invalid arguments"
./output/analyzer 10  > /dev/null 2>&1
if [ $? -ne 1 ]; then
    print_test_result 1 "Test 1b FAILED: Should return exit code 1 for no arguments"
    ((TESTS_FAILED++))
else
    print_test_result 0 "Invalid arguments handled correctly"
    ((TESTS_PASSED++))
fi


# Test 2: Invalid queue size
print_status "Test 2: Invalid queue size"
./output/analyzer invalid_queue_size logger  > /dev/null 2>&1
if [ $? -ne 1 ]; then
    print_test_result 1 "Test 2 FAILED: Should return exit code 1 for invalid queue size"
    ((TESTS_FAILED++))
else
    print_test_result 0 "Invalid queue size handled correctly"
    ((TESTS_PASSED++))
fi


# Test 3: Queue size = 0
print_status "Test 3: Queue size = 0"
./output/analyzer 0 logger  > /dev/null 2>&1
if [ $? -ne 1 ]; then
    print_test_result 1 "Test 3 FAILED: Should return exit code 1 for queue size 0"
    ((TESTS_FAILED++))
else
    print_test_result 0 "Queue size 0 handled correctly"
    ((TESTS_PASSED++))
fi


# Test 4: Negative queue size
print_status "Test 4: Negative queue size"
./output/analyzer -5 logger  > /dev/null 2>&1
if [ $? -ne 1 ]; then
    print_test_result 1 "Test 4 FAILED: Should return exit code 1 for negative queue size"
    ((TESTS_FAILED++))
else
    print_test_result 0 "Negative queue size handled correctly"
    ((TESTS_PASSED++))
fi


# Test 5: Decimal queue size
print_status "Test 5: Decimal queue size"
./output/analyzer 3.14 logger > /dev/null 2>&1
if [ $? -ne 1 ]; then
    print_test_result 1 "Test 5 FAILED: Should return exit code 1 for decimal queue size"
    ((TESTS_FAILED++))
else
    print_test_result 0 "Decimal queue size handled correctly"
    ((TESTS_PASSED++))
fi


# Test 6: Non-existent plugin
print_status "Test 6: Non-existent plugin"
./output/analyzer 10 nonexistent_plugin  > /dev/null 2>&1
if [ $? -ne 1 ]; then
    print_test_result 1 "Test 6 FAILED: Should return exit code 1 for non-existent plugin"
    ((TESTS_FAILED++))
else
    print_test_result 0 "Non-existent plugin handled correctly"
    ((TESTS_PASSED++))
fi


# Test 7: Simple logger test
print_status "Test 7: Simple logger test"
EXPECTED="[logger] hello"
ACTUAL=$(echo -e "hello\n<END>" | ./output/analyzer 10 logger 2>/dev/null | grep "\[logger\]" | head -1)
if [ "$ACTUAL" = "$EXPECTED" ]; then
    print_test_result 0 "Logger plugin works correctly"
    ((TESTS_PASSED++))
else
    print_test_result 1 "Test 7 FAILED: Expected '$EXPECTED', got '$ACTUAL'"
    ((TESTS_FAILED++))
fi


# Test 8: Uppercaser test
print_status "Test 8: Uppercaser test"
EXPECTED="[logger] HELLO"
ACTUAL=$(echo -e "hello\n<END>" | ./output/analyzer 10 uppercaser logger 2>/dev/null | grep "\[logger\]" | head -1)
if [ "$ACTUAL" = "$EXPECTED" ]; then
    print_test_result 0 "Uppercaser plugin works correctly"
    ((TESTS_PASSED++))
else
    print_test_result 1 "Test 8 FAILED: Expected '$EXPECTED', got '$ACTUAL'"
    ((TESTS_FAILED++))
fi


# Test 9: Rotator test
print_status "Test 9: Rotator test"
EXPECTED="[logger] ohell"
ACTUAL=$(echo -e "hello\n<END>" | ./output/analyzer 10 rotator logger 2>/dev/null | grep "\[logger\]" | head -1)
if [ "$ACTUAL" = "$EXPECTED" ]; then
    print_test_result 0 "Rotator plugin works correctly"
    ((TESTS_PASSED++))
else
    print_test_result 1 "Test 9 FAILED: Expected '$EXPECTED', got '$ACTUAL'"
    ((TESTS_FAILED++))
fi


# Test 10: Flipper test
print_status "Test 10: Flipper test"
EXPECTED="[logger] olleh"
ACTUAL=$(echo -e "hello\n<END>" | ./output/analyzer 10 flipper logger 2>/dev/null | grep "\[logger\]" | head -1)
if [ "$ACTUAL" = "$EXPECTED" ]; then
    print_test_result 0 "Flipper plugin works correctly"
    ((TESTS_PASSED++))
else
    print_test_result 1 "Test 10 FAILED: Expected '$EXPECTED', got '$ACTUAL'"
    ((TESTS_FAILED++))
fi


# Test 11: Expander test
print_status "Test 11: Expander test"
EXPECTED="[logger] h e l l o"
ACTUAL=$(echo -e "hello\n<END>" | ./output/analyzer 10 expander logger 2>/dev/null | grep "\[logger\]" | head -1)
if [ "$ACTUAL" = "$EXPECTED" ]; then
    print_test_result 0 "Expander plugin works correctly"
    ((TESTS_PASSED++))
else
    print_test_result 1 "Test 11 FAILED: Expected '$EXPECTED', got '$ACTUAL'"
    ((TESTS_FAILED++))
fi


# Test 12: Complex pipeline (the example from the assignment)
print_status "Test 12: Complex pipeline test"
EXPECTED="[logger] OHELL"
ACTUAL=$(echo -e "hello\n<END>" | ./output/analyzer 20 uppercaser rotator logger flipper typewriter 2>/dev/null | grep "\[logger\]" | head -1)
if [ "$ACTUAL" = "$EXPECTED" ]; then
    print_test_result 0 "Complex pipeline works correctly"
    ((TESTS_PASSED++))
else
    print_test_result 1 "Test 12 FAILED: Expected '$EXPECTED', got '$ACTUAL'"
    ((TESTS_FAILED++))
fi


# Test 13: Typewriter after logger (simple, same-line)
print_status "Test 13: Typewriter after logger"

EXPECTED_LOGGER='[logger] hello'
OUTPUT="$(echo -e "hello\n<END>" | ./output/analyzer 10 logger typewriter 2>/dev/null)"

if ! printf "%s\n" "$OUTPUT" | grep -Fqx "$EXPECTED_LOGGER"; then
    print_test_result 1 "Test 13 FAILED: Logger line mismatch. Expected '$EXPECTED_LOGGER', got '$(printf "%s\n" "$OUTPUT" | grep -m1 '^\[logger\] hello$' || printf "<empty>")'"
  ((TESTS_FAILED++))
else
  AFTER_LOGGER_LINE="$(printf "%s\n" "$OUTPUT" | sed -n '/^\[logger\] hello$/,$p' | sed '1d' | sed -n '1p')"
  if [ "$AFTER_LOGGER_LINE" = "[typewriter] hello" ]; then
    print_test_result 0 "Typewriter printed '[typewriter] hello' on the next line"
    ((TESTS_PASSED++))
  else
    print_test_result 1 "Test 13 FAILED: Expected '[typewriter] hello' after logger, got '${AFTER_LOGGER_LINE:-<empty>}'"
    ((TESTS_FAILED++))
  fi
fi


# Test 14: Multiple inputs
print_status "Test 14: Multiple inputs"
OUTPUT=$(echo -e "hello\nworld\n<END>" | ./output/analyzer 10 logger 2>/dev/null | grep "\[logger\]")
if [[ "$OUTPUT" == *"[logger] hello"* ]] && [[ "$OUTPUT" == *"[logger] world"* ]]; then
    print_test_result 0 "Multiple inputs handled correctly"
    ((TESTS_PASSED++))
else
    print_test_result 1 "Test 14 FAILED: Multiple inputs not handled correctly"
    ((TESTS_FAILED++))
fi


# Test 15: Same plugin used multiple times
# print_status "Test 15: Same plugin used multiple times"
# EXPECTED="[logger] HELLO"
# ACTUAL=$(echo -e "hello\n<END>" | ./output/analyzer 10 uppercaser uppercaser logger 2>/dev/null | grep "\[logger\]" | head -1)
# if [ "$ACTUAL" = "$EXPECTED" ]; then
#     print_test_result 0 "Same plugin used multiple times works correctly"
#     ((TESTS_PASSED++))
# else
#     print_test_result 1 "Test 15 FAILED: Expected '$EXPECTED', got '$ACTUAL'"
#     ((TESTS_FAILED++))
# fi


# Test 15: Typewriter plugin (just check it doesn't crash)
print_status "Test 15: Typewriter plugin"
timeout 10s bash -c 'echo -e "hi\n<END>" | ./output/analyzer 5 typewriter' > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_test_result 0 "Typewriter plugin works without crashing"
    ((TESTS_PASSED++))
else
    print_test_result 1 "Test 15 FAILED: Typewriter plugin crashed or timed out"
    ((TESTS_FAILED++))
fi


# Test 16: Large queue size
print_status "Test 16: Large queue size"
EXPECTED="[logger] hello"
ACTUAL=$(echo -e "hello\n<END>" | ./output/analyzer 1000 logger 2>/dev/null | grep "\[logger\]" | head -1)
if [ "$ACTUAL" = "$EXPECTED" ]; then
    print_test_result 0 "Large queue size works correctly"
    ((TESTS_PASSED++))
else
    print_test_result 1 "Test 16 FAILED: Expected '$EXPECTED', got '$ACTUAL'"
    ((TESTS_FAILED++))
fi


# Test 17: Small queue size
print_status "Test 17: Small queue size"
EXPECTED="[logger] hello"
ACTUAL=$(echo -e "hello\n<END>" | ./output/analyzer 1 logger 2>/dev/null  | grep "\[logger\]" | head -1)
if [ "$ACTUAL" = "$EXPECTED" ]; then
    print_test_result 0 "Small queue size works correctly"
    ((TESTS_PASSED++))
else
    print_test_result 1 "Test 17 FAILED: Expected '$EXPECTED', got '$ACTUAL'"
    ((TESTS_FAILED++))
fi


# Test 18: Simple given test
print_status "Test 18: Simple given test"
EXPECTED="[logger] HELLO"
ACTUAL=$(echo "hello
<END>" | ./output/analyzer 10 uppercaser logger 2>/dev/null | grep "\[logger\]")
if [ "$ACTUAL" == "$EXPECTED" ]; then
    print_test_result 0 "Simple given test passed correctly"
    ((TESTS_PASSED++))
else
    print_test_result 1 "Test 18: Simple given test (Test 18): FAIL (Expected '$EXPECTED', got '$ACTUAL')"
    ((TESTS_FAILED++))
fi


# Test 19: Usage goes to stdout on invalid args
print_status "Test 19: Usage printed to stdout"
USAGE_OUT="$(./output/analyzer 2>/dev/null || true)"
echo "$USAGE_OUT" | grep -q "^Usage: ./analyzer " \
  && echo "$USAGE_OUT" | grep -q "Available plugins:" \
  && echo "$USAGE_OUT" | grep -q "uppercaser" \
  && echo "$USAGE_OUT" | grep -q "rotator"
print_test_result $? "Usage text appears on stdout with plugin list"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))


# Test 20: Usage printed when plugin load fails
print_status "Test 20: Non-existent plugin prints usage"
OUT="$(./output/analyzer 10 no_such_plugin 2>/dev/null || true)"
echo "$OUT" | grep -q "^Usage: ./analyzer "
print_test_result $? "Usage printed on plugin load failure"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))


# Test 21: Empty line propagates
print_status "Test 21: Empty input line"
OUT="$(printf "\n<END>\n" | ./output/analyzer 10 logger 2>/dev/null)"
echo "$OUT" | grep -q '^\[logger\] $'
print_test_result $? "Logger printed an empty string line"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))


# Test 22: Order sensitivity
print_status "Test 22: Order matters (expander vs rotator)"
OUT1=$(echo -e "ab\n<END>" | ./output/analyzer 10 expander rotator logger 2>/dev/null | grep "\[logger\]" | head -1)
OUT2=$(echo -e "ab\n<END>" | ./output/analyzer 10 rotator expander logger 2>/dev/null | grep "\[logger\]" | head -1)
[ "$OUT1" != "$OUT2" ]
print_test_result $? "Different order yields different results (good!)"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))


# Test 23: Throughput with many lines
print_status "Test 23: 50 lines throughput"
CNT=$( (seq 1 50; echo "<END>") | ./output/analyzer 5 logger 2>/dev/null | grep -c '^\[logger\] ')
[ "$CNT" -eq 50 ]
print_test_result $? "All 50 lines were processed"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))


# Test 24: Backpressure with small queue and slow consumer
print_status "Test 24: Backpressure no-deadlock (queue=1 + typewriter)"
timeout 15s bash -c '(printf "aa\nbb\ncc\n<END>\n") | ./output/analyzer 1 typewriter 2>/dev/null' >/dev/null 2>&1
RC=$?
[ $RC -eq 0 ]
print_test_result $? "Pipeline completed under backpressure (no deadlock/timeout)"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))


# Test 25: <END> is not printed by logger
print_status "Test 25: <END> is control signal only"
OUT="$(echo -e "<END>\n" | ./output/analyzer 10 logger 2>/dev/null || true)"
! echo "$OUT" | grep -q '^\[logger\] <END>$'
print_test_result $? "<END> was not logged (as expected)"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))


# Test 26: Preserve leading/trailing spaces
print_status "Test 26: Leading/trailing spaces preserved"
EXPECTED='[logger]   HELLO  ' 
OUT="$( (printf "  HeLLo  \n<END>\n") | ./output/analyzer 10 uppercaser logger 2>/dev/null | grep '^\[logger\] ')"
echo "$OUT" | grep -q '^\[logger\]   HELLO  $'
print_test_result $? "Spaces preserved around text after uppercaser"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))


# Test 27: Long line (1024 chars)
print_status "Test 27: 1024-char line end-to-end"
LINE="$(head -c 1024 < /dev/zero | tr '\0' 'a')"
OUT="$( (printf "%s\n<END>\n" "$LINE") | ./output/analyzer 20 logger 2>/dev/null | sed -n '1p')"
PAYLOAD="$(echo "$OUT" | sed 's/^\[logger\] //')"
LEN=$(printf "%s" "$PAYLOAD" | wc -c)
[ "$LEN" -eq 1024 ]
print_test_result $? "Logger printed full 1024-char line"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))


# Test 28: Compare two pipelines produce different logs
print_status "Test 28: Uppercaser before vs after logger"
OUT1=$(echo -e "hello\n<END>" | ./output/analyzer 10 uppercaser logger 2>/dev/null | grep "\[logger\]" | head -1)
OUT2=$(echo -e "hello\n<END>" | ./output/analyzer 10 logger uppercaser 2>/dev/null | grep "\[logger\]" | head -1)
[ "$OUT1" != "$OUT2" ]
print_test_result $? "Different pipeline shapes produce different logger output"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))


# Test 29: Check input with 1024 chars are processed
print_status "Test 29: Check input edge case: input with 1024 (Check if processed)"

LONG="$(head -c 1024 < /dev/zero | tr '\0' 'a')"
OUT="$( (printf "%s\n<END>\n" "$LONG") | ./output/analyzer 10 logger 2>/dev/null )"

PAYLOAD="$(printf "%s\n" "$OUT" \
  | grep '^\[logger\] ' \
  | grep -v '^\[logger\] <END>$' \
  | sed 's/^\[logger\] //' \
  | tr -d '\n')"

EXPECTED="${LONG:0:1024}"

if [ "${#PAYLOAD}" -eq 1024 ] && [ "$PAYLOAD" = "$EXPECTED" ]; then
  print_test_result 0 "Only the first 1024 chars were processed (as required)"
  ((TESTS_PASSED++))
else
  print_test_result 1 "Test 29 FAILED: got len=${#PAYLOAD}, expected 1024"
  ((TESTS_FAILED++))
fi

# Test 30: All plugins together (no duplicates)
print_status "Test 30: All plugins together (expander→uppercaser→rotator→flipper→logger→typewriter)"

EXPECTED='[logger]  AB'
ACTUAL=$(echo -e "ab\n<END>" | ./output/analyzer 10 expander uppercaser rotator flipper logger typewriter 2>/dev/null | grep '^\[logger\] ' | head -1)

if [ "$ACTUAL" = "$EXPECTED" ]; then
  print_test_result 0 "All-plugins pipeline produced the expected logger output"
  ((TESTS_PASSED++))
else
  print_test_result 1 "Test 30 FAILED: Expected '$EXPECTED', got '${ACTUAL:-<empty>}'"
  ((TESTS_FAILED++))
fi

# Test 31: All plugins under load (order preserved) — fast (no typewriter)
print_status "Test 31: All plugins with heavy input (order preserved, no typewriter)"

INPUTS=(ab cd eFg hIj Klm nop q rs tuv w xyz pqrs abcd mnOp Q rstu vw xyZ aaa bBb ccC dDd eee fF g hh iii jJ kk LL mm N ooo ppP qqq r rr sss)

# Simulate plugin effects up to logger:
plugin_expander() { printf "%s" "$1" | sed 's/./& /g; s/ $//'; }
plugin_upper()    { printf "%s" "$1" | tr '[:lower:]' '[:upper:]'; }
plugin_rotator()  { local s="$1"; local last="${s: -1}"; local rest="${s%?}"; printf "%s" "$last$rest"; }
plugin_flipper()  { printf "%s" "$1" | rev; }

expected_for() {
  local s="$1"
  s="$(plugin_expander "$s")"
  s="$(plugin_upper "$s")"
  s="$(plugin_rotator "$s")"
  s="$(plugin_flipper "$s")"
  printf "[logger] %s\n" "$s"
}

EXPECTED="$(for w in "${INPUTS[@]}"; do expected_for "$w"; done)"

OUT="$( (printf "%s\n" "${INPUTS[@]}"; echo "<END>") \
       | timeout 10s ./output/analyzer 1 expander uppercaser rotator flipper logger 2>/dev/null )"

ACTUAL="$(printf "%s\n" "$OUT" | grep '^\[logger\] ')"

if [ "$ACTUAL" = "$EXPECTED" ]; then
  print_test_result 0 "Logger lines match expected content & order under load (no typewriter)"
  ((TESTS_PASSED++))
else
  print_test_result 1 "Test 31 FAILED: logger output mismatch (order/content)"
  ((TESTS_FAILED++))
  DIFF="$(diff -u <(printf "%s\n" "$EXPECTED") <(printf "%s\n" "$ACTUAL") | sed -n '1,20p')"
  [ -n "$DIFF" ] && printf "%s\n" "$DIFF"
fi


# Print final results
echo
print_status "Test Summary:"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    print_status "All tests PASSED!"
    exit 0
else
    print_error "Some tests FAILED!"
    exit 1
fi
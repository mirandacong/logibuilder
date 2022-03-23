# The test data of the the semantic

The dir includes the test data of the sematic three steps below:

* assignFbInNode
* buildCell
* assignCellInNodes

You can get more infomation about the three steps from the `../index.ts`

## File endwith `.afi.golden.yaml`

Test file for step `assignFbInNode` as expected test data.

## File endwith `.bc.golden.yaml`

Test file for step `buildCell` as expected test data.

## File endwith `.aci.golden.yaml`

Test file for step `assignCellInNodes` as expected test data.

## Souce input file

All functions input file is at `../../logi_test_data`, and the test file
point to the souce file via the name, for example, `logi.bc.yaml => logi.ts`

## Generate test data

You can generate the test data automaticly via the tool `../gen_test_data.ts`
and you need to confirm the test data after generation.

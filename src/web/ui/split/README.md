# angular-split

NOTE: Do not preview to open it.

 PERCENT MODE ([unit]="'percent'")
 ___________________________________________________________________________________________
|       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
|-------------------------------------------------------------------------------------------|
|       20                 30                 20                 15                 15      | <-- [size]="x"
|               10px               10px               10px               10px               | <-- [gutterSize]="10"
|calc(20% - 8px)    calc(30% - 12px)   calc(20% - 8px)    calc(15% - 6px)    calc(15% - 6px)| <-- CSS flex-basis property (with flex-grow&shrink at 0)
|     152px              228px              152px              114px              114px     | <-- el.getBoundingClientRect().width
|___________________________________________________________________________________________|
                                                                                800px         <-- el.getBoundingClientRect().width
 flex-basis = calc( { area.size }% - { area.size/100 *nbGutter*gutterSize }px );

 PIXEL MODE ([unit]="'pixel'")
 ___________________________________________________________________________________________
|       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
|-------------------------------------------------------------------------------------------|
|      100                250                 *                 150                100      | <-- [size]="y"
|               10px               10px               10px               10px               | <-- [gutterSize]="10"
|   0 0 100px          0 0 250px           1 1 auto          0 0 150px          0 0 100px   | <-- CSS flex property (flex-grow/flex-shrink/flex-basis)
|     100px              250px              200px              150px              100px     | <-- el.getBoundingClientRect().width
|___________________________________________________________________________________________|
                                                                                800px         <-- el.getBoundingClientRect().width

# Cited References

[angular-split](<https://github.com/bertrandg/angular-split)>

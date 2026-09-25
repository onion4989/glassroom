const pathG =
  "M405 974Q336 974 272.5 951Q209 928 159.5 883Q110 838 81 772Q52 706 52 620Q52 542 79.5 476.5Q107 411 157 363Q207 315 274.5 288.5Q342 262 422 262Q501 262 568 287.5Q635 313 682 363L636 410Q592 366 539 347Q486 328 425 328Q338 328 270.5 365.5Q203 403 164 469Q125 535 125 620Q125 689 148.5 743Q172 797 212.5 834Q253 871 304 890Q355 909 410 909Q463 909 514.5 891Q566 873 607 834L607 618L678 618L678 968L613 968L613 909Q572 942 518 958Q464 974 405 974Z";

const pathL = "M580 968L114 968L114 268L188 268L188 904L580 904L580 968Z";

const pathA =
  "M180 968L108 968L108 571Q108 469 144.5 400Q181 331 246.5 296.5Q312 262 400 262Q489 262 554.5 296.5Q620 331 656.5 400Q693 469 693 571L693 968L620 968L620 762L180 762L180 968ZM180 564L180 698L620 698L620 564Q620 445 561 386.5Q502 328 400 328Q298 328 239 386.5Q180 445 180 564Z";

const pathS =
  "M307 974Q228 974 157 948.5Q86 923 47 883L76 826Q113 863 175.5 887Q238 911 307 911Q405 911 450 875Q495 839 495 787Q495 746 472 721.5Q449 697 410.5 682.5Q372 668 326 657Q280 646 234 633.5Q188 621 149.5 600Q111 579 87.5 544.5Q64 510 64 454Q64 403 91.5 359Q119 315 176 288.5Q233 262 322 262Q381 262 439 278.5Q497 295 539 324L514 383Q469 353 418.5 339Q368 325 322 325Q226 325 181.5 362Q137 399 137 452Q137 493 160.5 517.5Q184 542 222.5 557Q261 572 307 582.5Q353 593 398.5 606Q444 619 482.5 639.5Q521 660 544.5 694Q568 728 568 783Q568 834 540 877.5Q512 921 454.5 947.5Q397 974 307 974Z";

const pathR =
  "M188 968L114 968L114 268L376 268Q509 268 585.5 331.5Q662 395 662 508Q662 590 620 646.5Q578 703 502 728L673 968L592 968L432 743Q405 746 376 746L188 746L188 968ZM188 332L188 683L374 683Q479 683 533.5 637Q588 591 588 508Q588 424 533.5 378Q479 332 374 332L188 332Z";

const pathO =
  "M420 974Q340 974 273 947.5Q206 921 156.5 873Q107 825 79.5 760Q52 695 52 618Q52 541 79.5 476Q107 411 156.5 363Q206 315 273 288.5Q340 262 420 262Q499 262 566 288.5Q633 315 682.5 363Q732 411 759.5 476Q787 541 787 618Q787 695 759.5 760Q732 825 682.5 873Q633 921 566 947.5Q499 974 420 974ZM420 908Q504 908 570.5 870.5Q637 833 675 767Q713 701 713 618Q713 535 675 469Q637 403 570.5 365.5Q504 328 420 328Q335 328 268.5 365.5Q202 403 163.5 469Q125 535 125 618Q125 701 163.5 767Q202 833 268.5 870.5Q335 908 420 908Z";

const pathM =
  "M188 968L114 968L114 268L185 268L185 384Q215 324 272 293Q329 262 406 262Q489 262 547 296.5Q605 331 631 394Q661 328 722 295Q783 262 863 262Q981 262 1049 329.5Q1117 397 1117 531L1117 968L1044 968L1044 533Q1044 428 991.5 378Q939 328 852 328Q761 328 706.5 380.5Q652 433 652 549L652 968L579 968L579 533Q579 428 528 378Q477 328 390 328Q299 328 243.5 380.5Q188 433 188 549L188 968Z";

const penG =
  "M640 380Q520 220 400 290Q90 340 100 620Q110 980 420 940Q620 900 640 760L640 1020";
const penL = "M151 200L151 936L640 936";
const archA =
  "M144 1040C144 620 200 360 400 295C600 360 656 620 656 1040";
const barA = "M170 730L650 730";
const penS =
  "M500 400C560 360 500 230 340 250C160 280 120 440 220 540C300 620 480 640 500 780C560 860 400 980 210 930";
const stemR = "M151 200L151 1020";
const bowlR =
  "M180 360C420 200 700 280 650 470C620 660 430 760 220 720";
const legR = "M450 730L660 1010";
const penO =
  "M420 295Q760 295 760 618Q760 960 420 941Q80 920 88 618Q100 280 420 295";
const leftM = "M151 200L151 1020";
const midM =
  "M160 500C280 160 520 160 406 300C560 430 660 360 615 500L615 1020";
const rightM =
  "M615 500C720 160 1020 160 863 300C980 430 1120 400 1080 540L1080 1020";

type Stroke = { d: string; part: number };

const brand: { outline: string; advance: number; strokes: Stroke[] }[] = [
  { outline: pathG, advance: 773, strokes: [{ d: penG, part: 1 }] },
  { outline: pathL, advance: 589, strokes: [{ d: penL, part: 1 }] },
  {
    outline: pathA,
    advance: 801,
    strokes: [
      { d: archA, part: 0.74 },
      { d: barA, part: 0.26 },
    ],
  },
  { outline: pathS, advance: 615, strokes: [{ d: penS, part: 1 }] },
  { outline: pathS, advance: 615, strokes: [{ d: penS, part: 1 }] },
  {
    outline: pathR,
    advance: 723,
    strokes: [
      { d: stemR, part: 0.34 },
      { d: bowlR, part: 0.42 },
      { d: legR, part: 0.24 },
    ],
  },
  { outline: pathO, advance: 839, strokes: [{ d: penO, part: 1 }] },
  { outline: pathO, advance: 839, strokes: [{ d: penO, part: 1 }] },
  {
    outline: pathM,
    advance: 1226,
    strokes: [
      { d: leftM, part: 0.22 },
      { d: midM, part: 0.39 },
      { d: rightM, part: 0.39 },
    ],
  },
];

export function DrawWord() {
  return brand.map((glyph, index) => {
    const maskId = `draw-pen-${index}`;
    return (
      <svg
        key={index}
        viewBox={`0 0 ${glyph.advance} 1000`}
        className="draw-ch"
        style={
          {
            width: `${glyph.advance / 1000}em`,
            "--i": index,
          } as React.CSSProperties
        }
        aria-hidden="true"
      >
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
          x="-80"
          y="-80"
          width={glyph.advance + 160}
          height="1160"
        >
          {glyph.strokes.map((stroke, strokeIx) => {
            const lag = glyph.strokes
              .slice(0, strokeIx)
              .reduce((sum, item) => sum + item.part, 0);
            return (
              <path
                key={strokeIx}
                className="draw-pen"
                d={stroke.d}
                pathLength={1}
                style={
                  {
                    "--part": stroke.part,
                    "--lag": `${lag * 2}s`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </mask>
        <path className="draw-glyph" d={glyph.outline} mask={`url(#${maskId})`} />
      </svg>
    );
  });
}

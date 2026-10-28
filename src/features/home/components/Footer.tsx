import Image from "next/image";

const imgSrc = "/assets/pages/top/footer/img_ft.jpg";
const imgAlt = "グラスルーム店内の様子";

export function Footer() {
  return (
    <footer
      data-footer
      aria-label="フッター"
      className="relative z-10 w-full bg-[#070707]"
    >
      <div className="flex flex-col items-center gap-[14px] pt-10 md:hidden">
        <p className="font-brand text-[32px] leading-none tracking-[0.3em] text-white">
          GLASSROOM
        </p>
        <p className="font-jp text-[12px] leading-none tracking-[0.3em] text-white">
          グラスルーム
        </p>
        <address className="font-jp text-[12px] leading-none tracking-[0.3em] text-white not-italic">
          東京都〇〇〇区〇〇〇町1-1-2
        </address>
        <div className="relative h-[130px] w-full">
          <Image
            src={imgSrc}
            alt={imgAlt}
            fill
            sizes="100vw"
            className="object-cover object-[center_40%]"
          />
        </div>
      </div>
      <div className="@container hidden w-full md:block">
        <div className="relative h-[160px] w-full border-t border-white lg:h-[20.833cqw]">
          <div className="absolute top-0 right-0 h-full w-[464px] overflow-hidden lg:left-[36.806cqw] lg:w-[63.194cqw]">
            <Image
              src={imgSrc}
              alt={imgAlt}
              fill
              sizes="(min-width: 1024px) 63vw, 464px"
              className="object-cover object-bottom"
            />
          </div>

          <p className="absolute top-[46px] left-11 w-[227px] cursor-default font-brand text-[24px] leading-none tracking-[0.3em] text-white select-none lg:top-[5.903cqw] lg:left-[2.014cqw] lg:w-[31.458cqw] lg:text-[3.333cqw]">
            GLASSROOM
          </p>
          <p className="absolute top-[80px] left-11 w-[227px] cursor-default text-center font-jp text-[12px] leading-none tracking-[0.3em] whitespace-nowrap text-white select-none lg:top-[10.347cqw] lg:left-[13.611cqw] lg:w-auto lg:text-left lg:text-[1.111cqw]">
            グラスルーム
          </p>
          <address className="absolute top-[99px] left-11 cursor-default font-jp text-[12px] leading-none tracking-[0.3em] whitespace-nowrap text-white not-italic select-none lg:top-[12.431cqw] lg:left-[5.347cqw] lg:text-[1.389cqw]">
            東京都〇〇〇区〇〇〇町1-1-2
          </address>
        </div>
      </div>
    </footer>
  );
}

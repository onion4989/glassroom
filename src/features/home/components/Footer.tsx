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
        <div className="relative h-[20.833cqw] w-full border-t border-white">
          <div className="absolute top-0 left-[36.806cqw] h-full w-[63.194cqw] overflow-hidden">
            <Image
              src={imgSrc}
              alt={imgAlt}
              fill
              sizes="63vw"
              className="object-cover object-bottom"
            />
          </div>

          <p className="absolute top-[5.903cqw] left-[2.014cqw] w-[31.458cqw] cursor-default font-brand text-[3.333cqw] leading-none tracking-[0.3em] text-white select-none">
            GLASSROOM
          </p>
          <p className="absolute top-[10.347cqw] left-[13.611cqw] cursor-default font-jp text-[1.111cqw] leading-none tracking-[0.3em] whitespace-nowrap text-white select-none">
            グラスルーム
          </p>
          <address className="absolute top-[12.431cqw] left-[5.347cqw] cursor-default font-jp text-[1.389cqw] leading-none tracking-[0.3em] whitespace-nowrap text-white not-italic select-none">
            東京都〇〇〇区〇〇〇町1-1-2
          </address>
        </div>
      </div>
    </footer>
  );
}

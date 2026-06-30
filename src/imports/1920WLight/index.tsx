import imgLandingPng from "./61f9d38cef5dfc577b507b3f35af5181e51ce63b.png";
import imgEthosPicture from "./e07f166570be5a1cfe58162c1e0f069c18b250d6.png";
import img1Png from "./02fcd00bcd724eecf83f5f9db77efaa918c241bf.png";
import img2Png from "./153b6d915790b59ef9cc0702bfd46e0cde1d7524.png";
import img3Png from "./a815d91c62dcdad861267e6eb3e24fed774b4510.png";

function LandingPng() {
  return (
    <div className="h-[856px] max-w-[1344px] relative shrink-0 w-[1344px]" data-name="landing.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[88.32%] left-0 max-w-none top-[5.84%] w-full" src={imgLandingPng} />
      </div>
    </div>
  );
}

function PTaglineMargin() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[1536px] pb-[208px] relative shrink-0" data-name="p.tagline:margin">
      <div className="[word-break:break-word] flex flex-col font-['Quando:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[32px] whitespace-nowrap">
        <p className="leading-[48px]">{`"The sky is the daily bread of the eyes." - Ralph Waldo Emerson`}</p>
      </div>
    </div>
  );
}

function DivSection() {
  return (
    <div className="absolute content-stretch flex flex-col h-[1200px] items-center justify-center left-0 right-0 top-0" data-name="div#section1">
      <LandingPng />
      <PTaglineMargin />
    </div>
  );
}

function Li() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="li">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0 text-[#219ebc] text-[24px]">
        <p className="leading-[24px]">{`\uF1E5`}</p>
      </div>
      <div className="flex flex-col font-['Lato:Regular',sans-serif] justify-center relative shrink-0 text-[#023047] text-[18px]">
        <p className="leading-[27px]">{` Immersive Exploration`}</p>
      </div>
    </div>
  );
}

function Li1() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="li">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0 text-[#219ebc] text-[24px]">
        <p className="leading-[24px]">{`\uF0C0`}</p>
      </div>
      <div className="flex flex-col font-['Lato:Regular',sans-serif] justify-center relative shrink-0 text-[#023047] text-[18px]">
        <p className="leading-[27px]">{` Community Connection`}</p>
      </div>
    </div>
  );
}

function Li2() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="li">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0 text-[#219ebc] text-[24px]">
        <p className="leading-[24px]">{`\uF0EB`}</p>
      </div>
      <div className="flex flex-col font-['Lato:Regular',sans-serif] justify-center relative shrink-0 text-[#023047] text-[18px]">
        <p className="leading-[27px]">{` Inspired Insights`}</p>
      </div>
    </div>
  );
}

function Ul() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[15px] items-start leading-[0] not-italic relative shrink-0 w-full whitespace-nowrap" data-name="ul">
      <Li />
      <Li1 />
      <Li2 />
    </div>
  );
}

function DivCol() {
  return (
    <div className="flex-[1_0_0] max-w-[576px] min-w-px relative self-stretch" data-name="div.col-6">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] px-[12px] relative size-full">
        <Ul />
      </div>
    </div>
  );
}

function EthosPicture() {
  return (
    <div className="h-[350px] max-w-[250px] relative rounded-[8px] shrink-0 w-[250px]" data-name="Ethos Picture">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[8px]">
        <img alt="" className="absolute h-[71.43%] left-0 max-w-none top-[14.29%] w-full" src={imgEthosPicture} />
      </div>
    </div>
  );
}

function DivEthosPicture() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="div.ethos-picture">
      <EthosPicture />
    </div>
  );
}

function DivCol1() {
  return (
    <div className="flex-[1_0_0] max-w-[576px] min-w-px relative self-stretch" data-name="div.col-6">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] px-[12px] relative size-full">
        <DivEthosPicture />
      </div>
    </div>
  );
}

function DivRow() {
  return (
    <div className="content-stretch flex flex-wrap gap-0 h-[350px] items-start relative shrink-0 w-full" data-name="div.row">
      <DivCol />
      <DivCol1 />
    </div>
  );
}

function H() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="h2">
      <div className="[word-break:break-word] flex flex-col font-['Quando:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[24.3px] w-full">
        <p className="leading-[38.4px]">Our Ethos</p>
      </div>
    </div>
  );
}

function P() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="p">
      <div className="[word-break:break-word] flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[18px] w-full">
        <p className="leading-[27px]">At The Blue Book Club, we believe in:</p>
      </div>
    </div>
  );
}

function Li3() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="li">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Lato:Regular',sans-serif] justify-center left-0 text-[16px] top-[12px] w-[0.131px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]">{` `}</span>
          </li>
        </ul>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Lato:Bold',sans-serif] justify-center left-0 text-[0px] top-[23.5px] whitespace-nowrap">
        <p className="mb-0 text-[16px]">
          <span className="font-['Lato:Bold',sans-serif] leading-[24px]">Immersive Exploration:</span>
          <span className="font-['Lato:Regular',sans-serif] leading-[24px]">{` Dive deep into the heart of each story as we explore`}</span>
        </p>
        <p className="font-['Lato:Regular',sans-serif] leading-[24px] text-[16px]">themes, characters, and hidden meanings together.</p>
      </div>
    </div>
  );
}

function Li4() {
  return (
    <div className="h-[72px] relative shrink-0 w-full" data-name="li">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Lato:Regular',sans-serif] justify-center left-0 text-[16px] top-[12px] w-[0.131px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]">{` `}</span>
          </li>
        </ul>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Lato:Bold',sans-serif] justify-center left-0 text-[0px] top-[35.5px] whitespace-nowrap">
        <p className="mb-0 text-[16px]">
          <span className="font-['Lato:Bold',sans-serif] leading-[24px]">Community Connection:</span>
          <span className="font-['Lato:Regular',sans-serif] leading-[24px]">{` Forge meaningful connections with fellow readers`}</span>
        </p>
        <p className="font-['Lato:Regular',sans-serif] leading-[24px] mb-0 text-[16px]">who share your passion for literature, creating bonds that transcend the</p>
        <p className="font-['Lato:Regular',sans-serif] leading-[24px] text-[16px]">pages.</p>
      </div>
    </div>
  );
}

function Li5() {
  return (
    <div className="h-[72px] relative shrink-0 w-full" data-name="li">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Lato:Regular',sans-serif] justify-center left-0 text-[16px] top-[12px] w-[0.131px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]">{` `}</span>
          </li>
        </ul>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Lato:Bold',sans-serif] justify-center left-0 text-[0px] top-[35.5px] whitespace-nowrap">
        <p className="mb-0 text-[16px]">
          <span className="font-['Lato:Bold',sans-serif] leading-[24px]">Inspired Insights:</span>
          <span className="font-['Lato:Regular',sans-serif] leading-[24px]">{` Gain fresh perspectives and enrich your reading`}</span>
        </p>
        <p className="font-['Lato:Regular',sans-serif] leading-[24px] mb-0 text-[16px]">experience through engaging discussions, author interviews, and exclusive</p>
        <p className="font-['Lato:Regular',sans-serif] leading-[24px] text-[16px]">content.</p>
      </div>
    </div>
  );
}

function Ul1() {
  return (
    <div className="relative shrink-0 w-full" data-name="ul">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[10px] items-start leading-[0] not-italic pl-[20px] relative size-full text-[#023047]">
        <Li3 />
        <Li4 />
        <Li5 />
      </div>
    </div>
  );
}

function DivEthosDescription() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-name="div.ethos-description">
      <H />
      <P />
      <Ul1 />
    </div>
  );
}

function DivColMd5() {
  return (
    <div className="flex-[1_0_0] min-w-px relative self-stretch" data-name="div.col-md-12">
      <div className="content-stretch flex flex-col items-start px-[12px] relative size-full">
        <DivEthosDescription />
      </div>
    </div>
  );
}

function DivRow1() {
  return (
    <div className="content-stretch flex flex-wrap h-[333.39px] items-start justify-center min-h-[333.3900146484375px] relative shrink-0 w-full" data-name="div.row">
      <DivColMd5 />
    </div>
  );
}

function DivContainer() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[1320px] px-[372px] py-[384px] relative shrink-0 w-[1320px]" data-name="div.container">
      <DivRow />
      <DivRow1 />
    </div>
  );
}

function DivSection1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[1451.39px] items-center justify-center left-0 right-0 top-[1074.31px]" data-name="div#section2">
      <DivContainer />
    </div>
  );
}

function Component1Png() {
  return (
    <div className="aspect-[168/268] max-w-[1344px] relative shrink-0 w-full" data-name="1.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[62.69%] left-0 max-w-none top-[18.66%] w-full" src={img1Png} />
      </div>
    </div>
  );
}

function H1() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="h2">
      <div className="[word-break:break-word] flex flex-col font-['Quando:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[24.6px] text-center whitespace-nowrap">
        <p className="leading-[38.4px]">Exploration</p>
      </div>
    </div>
  );
}

function P1() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[8px] relative shrink-0 w-full" data-name="p">
      <div className="[word-break:break-word] flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[16px] text-center whitespace-nowrap">
        <p className="leading-[24px] mb-0">Uncover the underlying</p>
        <p className="leading-[24px] mb-0">themes that resonate</p>
        <p className="leading-[24px] mb-0">within each book,</p>
        <p className="leading-[24px] mb-0">delving beyond the</p>
        <p className="leading-[24px] mb-0">surface to discover</p>
        <p className="leading-[24px]">hidden treasures.</p>
      </div>
    </div>
  );
}

function DivInfographic() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="div.infographic">
      <Component1Png />
      <H1 />
      <P1 />
    </div>
  );
}

function DivColMd() {
  return (
    <div className="flex-[1_0_0] max-w-[576px] min-w-px relative self-stretch" data-name="div.col-md-4">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] px-[12px] relative size-full">
        <DivInfographic />
      </div>
    </div>
  );
}

function Component2Png() {
  return (
    <div className="aspect-[168/268] max-w-[1344px] relative shrink-0 w-full" data-name="2.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[62.69%] left-0 max-w-none top-[18.66%] w-full" src={img2Png} />
      </div>
    </div>
  );
}

function H2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="h2">
      <div className="[word-break:break-word] flex flex-col font-['Quando:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[25.1px] text-center whitespace-nowrap">
        <p className="leading-[38.4px]">Reading</p>
      </div>
    </div>
  );
}

function P2() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[8px] relative shrink-0 w-full" data-name="p">
      <div className="[word-break:break-word] flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[16px] text-center whitespace-nowrap">
        <p className="leading-[24px] mb-0">Embark on a journey</p>
        <p className="leading-[24px] mb-0">with unforgettable</p>
        <p className="leading-[24px] mb-0">characters, analyzing</p>
        <p className="leading-[24px] mb-0">their motivations,</p>
        <p className="leading-[24px] mb-0">growth, and impact on</p>
        <p className="leading-[24px]">the narrative.</p>
      </div>
    </div>
  );
}

function DivInfographic1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="div.infographic">
      <Component2Png />
      <H2 />
      <P2 />
    </div>
  );
}

function DivColMd1() {
  return (
    <div className="flex-[1_0_0] max-w-[576px] min-w-px relative self-stretch" data-name="div.col-md-4">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] px-[12px] relative size-full">
        <DivInfographic1 />
      </div>
    </div>
  );
}

function Component3Png() {
  return (
    <div className="aspect-[168/268] max-w-[1344px] relative shrink-0 w-full" data-name="3.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[62.69%] left-0 max-w-none top-[18.66%] w-full" src={img3Png} />
      </div>
    </div>
  );
}

function H3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="h2">
      <div className="[word-break:break-word] flex flex-col font-['Quando:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[24.8px] text-center whitespace-nowrap">
        <p className="leading-[38.4px]">Discussion</p>
      </div>
    </div>
  );
}

function P3() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[8px] relative shrink-0 w-full" data-name="p">
      <div className="[word-break:break-word] flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[16px] text-center whitespace-nowrap">
        <p className="leading-[24px] mb-0">Engage in thought-</p>
        <p className="leading-[24px] mb-0">provoking discussions</p>
        <p className="leading-[24px] mb-0">that challenge</p>
        <p className="leading-[24px] mb-0">perspectives, spark</p>
        <p className="leading-[24px] mb-0">creativity, and foster a</p>
        <p className="leading-[24px] mb-0">deeper understanding</p>
        <p className="leading-[24px]">of the texts.</p>
      </div>
    </div>
  );
}

function DivInfographic2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="div.infographic">
      <Component3Png />
      <H3 />
      <P3 />
    </div>
  );
}

function DivColMd2() {
  return (
    <div className="flex-[1_0_0] max-w-[576px] min-w-px relative self-stretch" data-name="div.col-md-4">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] px-[12px] relative size-full">
        <DivInfographic2 />
      </div>
    </div>
  );
}

function DivRow2() {
  return (
    <div className="content-stretch flex flex-wrap gap-0 h-[512.39px] items-start min-h-[512.3900146484375px] relative shrink-0 w-full" data-name="div.row">
      <DivColMd />
      <DivColMd1 />
      <DivColMd2 />
    </div>
  );
}

function DivContainer1() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[1320px] px-[372px] py-[384px] relative shrink-0 w-[1320px]" data-name="div.container">
      <DivRow2 />
    </div>
  );
}

function DivSection2() {
  return (
    <div className="absolute content-stretch flex flex-col h-[1280.39px] items-center justify-center left-0 right-0 top-[2359.81px]" data-name="div#section3">
      <DivContainer1 />
    </div>
  );
}

function H4() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="h2">
      <div className="[word-break:break-word] flex flex-col font-['Quando:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[18.9px] text-center whitespace-nowrap">
        <p className="leading-[28.8px]">Contact Us</p>
      </div>
    </div>
  );
}

function P4() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[10.5px] relative shrink-0 w-full" data-name="p">
      <div className="[word-break:break-word] flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[18px] text-center whitespace-nowrap">
        <p className="leading-[27px] mb-0">Have any questions or suggestions? Feel</p>
        <p className="leading-[27px]">free to reach out to us!</p>
      </div>
    </div>
  );
}

function PContact() {
  return (
    <div className="[word-break:break-word] content-stretch flex items-center justify-center leading-[0] not-italic relative shrink-0 text-[#219ebc] text-[18px] text-center w-full whitespace-nowrap" data-name="p.contact">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0">
        <p className="leading-[18px]">{`\uF0E0`}</p>
      </div>
      <div className="flex flex-col font-['Lato:Regular',sans-serif] justify-center relative shrink-0">
        <p className="leading-[27px]">{` contact@bluebookclub.com`}</p>
      </div>
    </div>
  );
}

function PContact1() {
  return (
    <div className="[word-break:break-word] content-stretch flex items-center justify-center leading-[0] not-italic relative shrink-0 text-[#219ebc] text-[18px] text-center w-full whitespace-nowrap" data-name="p.contact">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0">
        <p className="leading-[18px]">{`\uF095`}</p>
      </div>
      <div className="flex flex-col font-['Lato:Regular',sans-serif] justify-center relative shrink-0">
        <p className="leading-[27px]">{` 123-456-7890`}</p>
      </div>
    </div>
  );
}

function DivColMd3() {
  return (
    <div className="content-stretch flex flex-col gap-[9.5px] items-start px-[12px] relative self-stretch shrink-0 w-[354.27px]" data-name="div.col-md-6">
      <H4 />
      <P4 />
      <PContact />
      <PContact1 />
    </div>
  );
}

function H5() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="h2">
      <div className="[word-break:break-word] flex flex-col font-['Quando:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[19.7px] text-center whitespace-nowrap">
        <p className="leading-[28.8px]">Follow Us</p>
      </div>
    </div>
  );
}

function P5() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[10px] relative shrink-0 w-full" data-name="p">
      <div className="[word-break:break-word] flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[18px] text-center whitespace-nowrap">
        <p className="leading-[27px] mb-0">Stay connected with us on social media for</p>
        <p className="leading-[27px]">updates and book recommendations:</p>
      </div>
    </div>
  );
}

function A() {
  return (
    <div className="bg-[#219ebc] content-stretch flex flex-col items-center pb-[9.5px] pt-[10.5px] relative rounded-[20px] shrink-0 size-[40px]" data-name="a">
      <div className="[word-break:break-word] flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-center text-white whitespace-nowrap">
        <p className="leading-[20px] text-[20px]">{`\uF39E`}</p>
      </div>
    </div>
  );
}

function A1() {
  return (
    <div className="bg-[#219ebc] content-stretch flex flex-col items-center pb-[9.5px] pt-[10.5px] relative rounded-[20px] shrink-0 size-[40px]" data-name="a">
      <div className="[word-break:break-word] flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-center text-white whitespace-nowrap">
        <p className="leading-[20px] text-[20px]">{`\uF099`}</p>
      </div>
    </div>
  );
}

function A2() {
  return (
    <div className="bg-[#219ebc] content-stretch flex flex-col items-center pb-[9.5px] pt-[10.5px] relative rounded-[20px] shrink-0 size-[40px]" data-name="a">
      <div className="[word-break:break-word] flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-center text-white whitespace-nowrap">
        <p className="leading-[20px] text-[20px]">{`\uF16D`}</p>
      </div>
    </div>
  );
}

function A3() {
  return (
    <div className="bg-[#219ebc] content-stretch flex flex-col items-center pb-[9.5px] pt-[10.5px] relative rounded-[20px] shrink-0 size-[40px]" data-name="a">
      <div className="[word-break:break-word] flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-center text-white whitespace-nowrap">
        <p className="leading-[20px] text-[20px]">{`\uF0D2`}</p>
      </div>
    </div>
  );
}

function Li6() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="li">
      <A3 />
    </div>
  );
}

function UlSocialIcons() {
  return (
    <div className="relative shrink-0 w-full" data-name="ul.social-icons">
      <div className="content-stretch flex gap-[16.2px] items-start pl-[60.84px] pr-[60.86px] pt-[8px] relative size-full">
        <A />
        <A1 />
        <A2 />
        <Li6 />
      </div>
    </div>
  );
}

function DivColMd4() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start px-[12px] relative self-stretch shrink-0 w-[354.27px]" data-name="div.col-md-6">
      <H5 />
      <P5 />
      <UlSocialIcons />
    </div>
  );
}

function DivRow3() {
  return (
    <div className="content-stretch flex flex-wrap gap-0 h-[186.8px] items-start min-h-[186.8000030517578px] relative shrink-0" data-name="div.row">
      <DivColMd3 />
      <DivColMd4 />
    </div>
  );
}

function DivContainer2() {
  return (
    <div className="max-w-[1320px] relative shrink-0 w-full" data-name="div.container">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] pl-[216.17px] pr-[216.18px] py-[228.172px] relative size-full">
        <DivRow3 />
      </div>
    </div>
  );
}

function FooterWhiteBackground() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start p-[57.594px] relative rounded-[30.22px] shrink-0 w-[1256.078px]" data-name="footer.white-background">
      <DivContainer2 />
    </div>
  );
}

function DivSection3() {
  return (
    <div className="absolute bg-[#ffb703] content-stretch flex flex-col h-[1200px] items-center justify-center left-0 right-0 top-[3600px]" data-name="div#section4">
      <FooterWhiteBackground />
    </div>
  );
}

function P6() {
  return (
    <div className="content-stretch flex flex-col items-center py-[10px] relative shrink-0 w-full" data-name="p">
      <div className="[word-break:break-word] flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[21px] mb-0">© 2024 The Blue Book Club.</p>
        <p className="leading-[21px]">All Rights Reserved.</p>
      </div>
    </div>
  );
}

function DivColMd6() {
  return (
    <div className="content-stretch flex flex-col items-start px-[12px] relative self-stretch shrink-0 w-[200px]" data-name="div.col-md-12">
      <P6 />
    </div>
  );
}

function DivRow4() {
  return (
    <div className="content-stretch flex flex-wrap h-[62px] items-start justify-center relative shrink-0" data-name="div.row">
      <DivColMd6 />
    </div>
  );
}

function DivContainer3() {
  return (
    <div className="max-w-[1320px] relative shrink-0 w-full" data-name="div.container">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] pl-[47.23px] pr-[47.24px] py-[59.234px] relative size-full">
        <DivRow4 />
      </div>
    </div>
  );
}

function DivFooterBottom() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col items-start left-[calc(50%-0.86px)] top-1/2 w-[294.47px]" data-name="div.footer-bottom">
      <DivContainer3 />
    </div>
  );
}

function DivSection4() {
  return (
    <div className="absolute h-[100px] left-0 overflow-clip right-0 top-[4800px]" data-name="div#section5">
      <DivFooterBottom />
    </div>
  );
}

function IFaSolid() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0" data-name="i.fa-solid">
      <div className="[word-break:break-word] flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#023047] text-[24px] text-center whitespace-nowrap">
        <p className="leading-[24px]">{`\uF0C9`}</p>
      </div>
    </div>
  );
}

function ToggleNavigation() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[6px] py-[7px] relative shrink-0" data-name="Toggle navigation">
      <IFaSolid />
    </div>
  );
}

function LiNavItem() {
  return (
    <div className="relative self-stretch shrink-0" data-name="li.nav-item">
      <div className="content-stretch flex flex-col items-start pb-[18.5px] pt-[17.5px] px-[18px] relative size-full">
        <button className="[word-break:break-word] cursor-pointer flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.65)] text-left whitespace-nowrap">
          <p className="leading-[24px]">Home</p>
        </button>
      </div>
    </div>
  );
}

function LiNavItem1() {
  return (
    <div className="relative self-stretch shrink-0" data-name="li.nav-item">
      <div className="content-stretch flex flex-col items-start pb-[18.5px] pt-[17.5px] px-[18px] relative size-full">
        <button className="[word-break:break-word] cursor-pointer flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.65)] text-left whitespace-nowrap">
          <p className="leading-[24px]">Ethos</p>
        </button>
      </div>
    </div>
  );
}

function LiNavItem2() {
  return (
    <div className="relative self-stretch shrink-0" data-name="li.nav-item">
      <div className="content-stretch flex flex-col items-start pb-[18.5px] pt-[17.5px] px-[18px] relative size-full">
        <button className="[word-break:break-word] cursor-pointer flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.65)] text-left whitespace-nowrap">
          <p className="leading-[24px]">Book Analysis</p>
        </button>
      </div>
    </div>
  );
}

function LiNavItem3() {
  return (
    <div className="relative self-stretch shrink-0" data-name="li.nav-item">
      <div className="content-stretch flex flex-col items-start pb-[18.5px] pt-[17.5px] px-[18px] relative size-full">
        <button className="[word-break:break-word] cursor-pointer flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.65)] text-left whitespace-nowrap">
          <p className="leading-[24px]">Contact</p>
        </button>
      </div>
    </div>
  );
}

function UlNavbarNav() {
  return (
    <div className="content-stretch flex h-[60px] items-start relative shrink-0" data-name="ul.navbar-nav">
      <LiNavItem />
      <LiNavItem1 />
      <LiNavItem2 />
      <LiNavItem3 />
    </div>
  );
}

function DivNavbarNav() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative" data-name="div#navbarNav">
      <UlNavbarNav />
    </div>
  );
}

function NavNavbar() {
  return (
    <div className="absolute bg-white content-stretch flex items-center left-0 p-[10px] right-0 rounded-[5px] top-0" data-name="nav.navbar">
      <ToggleNavigation />
      <DivNavbarNav />
    </div>
  );
}

export default function Component1920WLight() {
  return (
    <div className="bg-white relative size-full" data-name="1920w light">
      <DivSection />
      <DivSection1 />
      <DivSection2 />
      <DivSection3 />
      <DivSection4 />
      <NavNavbar />
    </div>
  );
}
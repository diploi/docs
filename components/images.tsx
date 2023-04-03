import Image from 'next/image';


export const GifImage = ({src, alt}) => {
  return <Image src={src} alt={alt} width={640} height={360} style={{marginTop: "30px;", borderRadius: '10px'}} unoptimized={true} />
};


export default function MyApp() {
  return <GifImage src="xx" alt="xx" />
}

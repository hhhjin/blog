import { useImage } from "react-image";

export function Image({
  className,
  src,
  alt,
  width,
  height,
  blurDataUrl,
}: {
  className?: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl: string;
}) {
  const {
    src: url,
    isLoading,
    error,
  } = useImage({
    srcList: src,
    useSuspense: false,
  });

  if (isLoading || error) {
    return (
      <span
        style={{
          backgroundImage: `url(${blurDataUrl})`,
          backgroundSize: "100%",
          width: width,
          height,
        }}
        className={className}
      />
    );
  }

  return (
    <img
      className={className}
      src={url}
      alt={alt}
      loading="lazy"
      width={width}
      height={height}
    />
  );
}

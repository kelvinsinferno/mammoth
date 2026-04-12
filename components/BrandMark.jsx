import Image from 'next/image';

export default function BrandMark({ size = 28, alt = 'Mammoth', rounded = 6, style = {} }) {
  return (
    <Image
      src="/mammoth-logo-dark.gif"
      alt={alt}
      width={size}
      height={size}
      style={{ borderRadius: rounded, objectFit: 'cover', display: 'block', ...style }}
      unoptimized
    />
  );
}

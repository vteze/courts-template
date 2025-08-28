
import Image from 'next/image';
import furiaLogo from '../../../public/icon.jpg';

export function AppLogo() {
  return (
    <Image
      src={furiaLogo} // Usa a imagem importada
      alt="Fúria Treinamentos Logo"
      width={36}
      height={36}
      className="h-9 w-9 rounded-sm"
      data-ai-hint="logo empresa"
      priority
    />
  );
}

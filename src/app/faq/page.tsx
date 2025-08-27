
import type { ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MapPin } from "lucide-react"; // Adicionado MapPin

interface FaqItem {
  question: string;
  answer: ReactNode; // Alterado para ReactNode para permitir JSX no mapa
  icon?: React.ElementType;
}

const faqData: FaqItem[] = [
  {
    question: "Preciso levar minha própria bola de futevôlei?",
    answer:
      "Temos bolas de futevôlei disponíveis na recepção para empréstimo durante o uso da quadra. Se preferir, você pode trazer a sua própria bola.",
  },
  {
    question: "Qual tipo de calçado devo usar para jogar futevôlei?",
    answer:
      "Recomendamos jogar descalço para melhor aderência e sensação na areia. Se preferir, meias específicas para esportes na areia (sand socks) são permitidas. Calçados fechados ou com solado rígido não são permitidos nas quadras para preservar a qualidade da areia e garantir a segurança.",
  },
  {
    question: "Vocês oferecem aulas de futevôlei?",
    answer:
      "Sim! Temos aulas para todos os níveis, desde iniciantes até jogadores avançados, com instrutores qualificados. Consulte nossa seção de aulas em breve ou entre em contato conosco para mais informações sobre horários, disponibilidade e pacotes.",
  },
  {
    question: "Como funciona o cancelamento de reservas de quadra?",
    answer:
      "Você pode cancelar suas reservas diretamente através da seção 'Minhas Reservas' em nosso site ou aplicativo. Pedimos que os cancelamentos sejam feitos com pelo menos 24 horas de antecedência para evitar taxas. Consulte nossa política completa de cancelamento para mais detalhes.",
  },
  {
    question: "Posso levar comida e bebida para a arena?",
    answer:
      "Dispomos de uma lanchonete com uma variedade de snacks, bebidas e lanches rápidos. Não é permitido o consumo de alimentos e bebidas trazidos de fora, com exceção de garrafas de água pessoais.",
  },
  {
    question: "A arena possui estacionamento disponível?",
    answer:
      "A arena não possui estacionamento próprio. No entanto, é geralmente possível estacionar na Rua Comendador Rodolfo Gomes, bem em frente à arena. Recomendamos sempre observar a sinalização local de trânsito e restrições de estacionamento.",
  },
  {
    question: "Como funcionam as inscrições por horário?",
    answer:
      "Após fazer login, escolha a data e o horário desejado (17:00, 18:00 ou 19:00) diretamente no cartão da quadra e clique em 'Entrar'. Cada horário possui vagas limitadas (12). Se mudar de ideia, clique em 'Sair' para cancelar sua inscrição.",
  },
  {
    question: "Como faço para reservar uma quadra?",
    answer:
      "Você pode reservar uma quadra diretamente através do nosso site ou aplicativo. Basta selecionar a quadra desejada, a data, o horário e seguir as instruções para confirmar sua reserva. É necessário estar logado para realizar uma reserva.",
  },
  {
    question: "Onde fica a Fúria Treinamentos Futevôlei?",
    icon: MapPin,
    answer: (
      <div className="space-y-4">
        <p>
          Atendemos na Refúgio Arena: Av. Edgar Píres de Castro, 986 - Hípica, Porto Alegre - RS, 91788-000.
        </p>
        <div className="overflow-hidden rounded-md border shadow-sm aspect-video w-full max-w-2xl mx-auto">
          <iframe
            src="https://www.google.com/maps?q=Ref%C3%BAgio%20Arena%2C%20Av.%20Edgar%20P%C3%ADres%20de%20Castro%2C%20986%20-%20H%C3%ADpica%2C%20Porto%20Alegre%20-%20RS%2C%2091788-000&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa da Localização da Refúgio Arena"
          ></iframe>
        </div>
        <p className="text-sm text-muted-foreground">
          Você pode clicar no mapa para interagir ou obter direções.
        </p>
      </div>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Perguntas Frequentes
          </h1>
        </div>
        <p className="text-lg text-foreground/70">
          Encontre respostas para as dúvidas mais comuns sobre a Fúria Treinamentos Futevôlei.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqData.map((item, index) => (
          <AccordionItem value={`item-${index}`} key={index} className="border-b border-border/70">
            <AccordionTrigger className="text-left text-lg hover:no-underline py-4 font-medium text-foreground">
              <div className="flex items-center gap-2">
                {item.icon && <item.icon className="h-5 w-5 text-primary flex-shrink-0" />}
                <span>{item.question}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 text-base text-foreground/80">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

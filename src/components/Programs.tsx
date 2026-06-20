import { forwardRef } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

interface ProgramItemProps {
  icon: string;
  title: string;
  bengaliTitle: string;
  description: string;
  isVisible?: boolean;
  delayClass: string;
}

const ProgramItem = forwardRef<HTMLDivElement, ProgramItemProps>(
  ({ icon, title, bengaliTitle, description, isVisible = false, delayClass }, ref) => (
    <div
      className={`program-item reveal ${delayClass} ${isVisible ? 'visible' : ''
        }`}
      ref={ref}
    >
      <div className="program-icon">{icon}</div>
      <div className="program-title">{title}</div>
      <div className="program-bengali">{bengaliTitle}</div>
      <p className="program-desc">{description}</p>
    </div>
  )
);

ProgramItem.displayName = 'ProgramItem';

export default function Programs() {
  const { refs, isVisible } = useScrollReveal(7);

  return (
    <section className="programs" id="programs">
      <div className="container">
        <div className={`reveal ${isVisible[0] ? 'visible' : ''}`} ref={refs[0]}>
          <div className="section-label">কার্যক্রম · Programs</div>
          <h2>Cultural Programs</h2>
          <p className="programs-sub">
            Year-round initiatives that keep the Bengali spirit alive, connect
            generations, and nurture our arts.
          </p>
        </div>
        
        <div 
          className={`reveal reveal-delay-1 ${isVisible[1] ? 'visible' : ''}`}
          ref={refs[1]}
          style={{ 
            textAlign: 'left', 
            marginTop: '24px', 
            marginBottom: '40px',
            fontFamily: '"Cormorant Garamond", serif', 
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', 
            color: 'var(--gold)', 
            fontStyle: 'italic',
            lineHeight: 1.2
          }}
        >
          Coming Soon...
        </div>
        <div className="programs-list">
          {/*
          <ProgramItem
            ref={refs[1]}
            icon="♪"
            title="Rabindra Sangeet Academy"
            bengaliTitle="রবীন্দ্র সংগীত"
            description="Weekly classes for children and adults in the classical Tagore song tradition — voice, harmonium, and tabla."
            isVisible={isVisible[1]}
            delayClass=""
          />
          <ProgramItem
            ref={refs[2]}
            icon="◈"
            title="Classical Dance"
            bengaliTitle="শাস্ত্রীয় নৃত্য"
            description="Bharatnatyam and Rabindra Nritya classes nurturing young dancers in the Bengali classical tradition."
            isVisible={isVisible[2]}
            delayClass="reveal-delay-1"
          />
          <ProgramItem
            ref={refs[3]}
            icon="✍"
            title="Bengali Language School"
            bengaliTitle="বাংলা ভাষা শিক্ষা"
            description="Ensuring the second generation remains connected to the script, literature, and poetry of their heritage."
            isVisible={isVisible[3]}
            delayClass="reveal-delay-2"
          />
          <ProgramItem
            ref={refs[4]}
            icon="🎬"
            title="Satyajit Ray Film Club"
            bengaliTitle="চলচ্চিত্র সংসদ"
            description="Monthly screenings and discussions of Bengali cinema — from Ray's Apu Trilogy to contemporary new wave directors."
            isVisible={isVisible[4]}
            delayClass="reveal-delay-3"
          />
          <ProgramItem
            ref={refs[5]}
            icon="◉"
            title="Adda & Literature"
            bengaliTitle="আড্ডা ও সাহিত্য"
            description="The grand Bengali tradition of open, intellectual conversation — poetry readings, book clubs, and storytelling evenings."
            isVisible={isVisible[5]}
            delayClass="reveal-delay-1"
          />
          <ProgramItem
            ref={refs[6]}
            icon="◐"
            title="Culinary Heritage"
            bengaliTitle="রন্ধন শিল্প"
            description="Preserving authentic Bengali recipes — from mustard-fish to mishti doi — through workshops and feast days."
            isVisible={isVisible[6]}
            delayClass="reveal-delay-2"
          />
          */}
        </div>
      </div>
    </section>
  );
}

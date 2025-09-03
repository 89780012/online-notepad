'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Heart,
  Users,
  Lightbulb,
  Calendar,
  Star
} from 'lucide-react';

interface UseCaseShowcaseProps {
  onNewNote?: () => void;
}

export default function UseCaseShowcase({ onNewNote }: UseCaseShowcaseProps) {
  const t = useTranslations();

  const useCaseCategories = [
    {
      icon: Briefcase,
      title: t('workProductivity'),
      description: t('workProductivityDesc'),
      examples: [
        t('meetingNotes'),
        t('projectPlanning'),
        t('taskLists'),
        t('brainstorming')
      ],
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    },
    {
      icon: GraduationCap,
      title: t('studyLearning'),
      description: t('studyLearningDesc'),
      examples: [
        t('lectureNotes'),
        t('researchNotes'),
        t('studyGuides'),
        t('examPrep')
      ],
      color: 'bg-green-500/10 text-green-600 dark:text-green-400'
    },
    {
      icon: Code,
      title: t('development'),
      description: t('developmentDesc'),
      examples: [
        t('codeSnippets'),
        t('apiDocs'),
        t('bugTracking'),
        t('techNotes')
      ],
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    },
    {
      icon: Heart,
      title: t('personalLife'),
      description: t('personalLifeDesc'),
      examples: [
        t('journaling'),
        t('recipes'),
        t('travelPlans'),
        t('ideas')
      ],
      color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
    },
    {
      icon: Users,
      title: t('collaboration'),
      description: t('collaborationDesc'),
      examples: [
        t('teamDocs'),
        t('sharedNotes'),
        t('feedback'),
        t('coordination')
      ],
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
    },
    {
      icon: BookOpen,
      title: t('writing'),
      description: t('writingDesc'),
      examples: [
        t('drafts'),
        t('outlines'),
        t('stories'),
        t('articles')
      ],
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
    }
  ];

  const testimonials = [
    {
      name: t('testimonial1Name'),
      role: t('testimonial1Role'),
      content: t('testimonial1Content'),
      rating: 5
    },
    {
      name: t('testimonial2Name'),
      role: t('testimonial2Role'),
      content: t('testimonial2Content'),
      rating: 5
    },
    {
      name: t('testimonial3Name'),
      role: t('testimonial3Role'),
      content: t('testimonial3Content'),
      rating: 5
    }
  ];

  const tips = [
    {
      icon: Lightbulb,
      title: t('tip1Title'),
      description: t('tip1Desc')
    },
    {
      icon: Calendar,
      title: t('tip2Title'),
      description: t('tip2Desc')
    },
    {
      icon: Code,
      title: t('tip3Title'),
      description: t('tip3Desc')
    }
  ];

  return (
    <div className="space-y-16">
      {/* 使用场景分类 */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-foreground text-center font-serif">
          {t('perfectFor')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCaseCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-lg border-border hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-foreground text-lg">
                      {category.title}
                    </CardTitle>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {category.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.examples.map((example, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 用户评价 */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-foreground text-center font-serif">
          {t('userTestimonials')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card/60 backdrop-blur-sm shadow-md border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle className="text-foreground text-base">
                  {testimonial.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {testimonial.role}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 使用技巧 */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-foreground text-center font-serif">
          {t('proTips')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tips.map((tip, index) => {
            const IconComponent = tip.icon;
            return (
              <Card key={index} className="bg-card/60 backdrop-blur-sm shadow-md border-border text-center">
                <CardHeader className="pb-3">
                  <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-3">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground text-lg">
                    {tip.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tip.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 行动号召 */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-foreground font-serif">
          {t('readyToStart')}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('readyToStartDesc')}
        </p>
        <Button
          onClick={onNewNote}
          size="lg"
          className="text-lg px-12 py-4 font-semibold bg-primary hover:bg-primary/90 shadow-lg"
        >
          {t('createFirstNote')}
        </Button>
      </section>
    </div>
  );
}

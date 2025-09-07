import { 
  FileText, 
  Users, 
  Calendar, 
  BookOpen, 
  Code, 
  Lightbulb, 
  ListTodo 
} from 'lucide-react';
import { TemplateCategory } from './types';

export const categories: TemplateCategory[] = [
  { id: 'all', name: 'allCategories', icon: FileText },
  { id: 'business', name: 'businessCategory', icon: Users },
  { id: 'personal', name: 'personalCategory', icon: Calendar },
  { id: 'education', name: 'educationCategory', icon: BookOpen },
  { id: 'technical', name: 'technicalCategory', icon: Code },
  { id: 'creative', name: 'creativeCategory', icon: Lightbulb },
  { id: 'productivity', name: 'productivityCategory', icon: ListTodo }
];
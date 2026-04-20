import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Home, X } from 'lucide-react';

interface ArticleDisplayProps {
  title: string;
  content: string;
  onClose: () => void;
  onNextLevel?: () => void;
  onBackToMenu: () => void;
}

export function ArticleDisplay({
  title,
  content,
  onClose,
  onNextLevel,
  onBackToMenu
}: ArticleDisplayProps) {
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${elements.length}`} className="text-gray-300 leading-relaxed mb-4">
            {currentParagraph.join('\n')}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('一、') || 
          trimmedLine.startsWith('二、') || 
          trimmedLine.startsWith('三、') || 
          trimmedLine.startsWith('四、') ||
          trimmedLine.startsWith('五、') ||
          trimmedLine.match(/^[一二三四五六七八九十]+、/)) {
        flushParagraph();
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-white mt-6 mb-4 border-b border-slate-600 pb-2">
            {trimmedLine}
          </h2>
        );
      } else if (trimmedLine.startsWith('小白：') || trimmedLine.startsWith('大东：')) {
        flushParagraph();
        const isXiaobai = trimmedLine.startsWith('小白：');
        const content = trimmedLine.replace(/^(小白：|大东：)/, '');
        elements.push(
          <div key={`dialog-${index}`} className={`flex gap-3 mb-4 ${isXiaobai ? '' : 'flex-row-reverse'}`}>
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${
              isXiaobai ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              {isXiaobai ? '白' : '东'}
            </div>
            <div className={`flex-1 p-3 rounded-lg ${
              isXiaobai ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-green-600/20 border border-green-500/30'
            }`}>
              <span className={`font-semibold ${isXiaobai ? 'text-blue-300' : 'text-green-300'}`}>
                {isXiaobai ? '小白' : '大东'}：
              </span>
              <span className="text-gray-300">{content}</span>
            </div>
          </div>
        );
      } else if (trimmedLine === '' || trimmedLine === '图片') {
        flushParagraph();
      } else if (trimmedLine.startsWith('来源：')) {
        flushParagraph();
        elements.push(
          <p key={`source-${index}`} className="text-sm text-gray-500 mt-6 pt-4 border-t border-slate-700">
            {trimmedLine}
          </p>
        );
      } else if (trimmedLine && !trimmedLine.startsWith('图片')) {
        currentParagraph.push(trimmedLine);
      }
    });

    flushParagraph();
    return elements;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] bg-slate-800 border-slate-600 flex flex-col">
        <CardHeader className="flex-shrink-0 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-white pr-8">{title}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-[60vh] p-6">
            <div className="prose prose-invert max-w-none">
              {formatContent(content)}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex-shrink-0 border-t border-slate-700 gap-2">
          <Button variant="outline" onClick={onBackToMenu} className="flex-1">
            <Home className="w-4 h-4 mr-2" />
            返回主界面
          </Button>
          {onNextLevel && (
            <Button onClick={onNextLevel} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
              下一关
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default ArticleDisplay;

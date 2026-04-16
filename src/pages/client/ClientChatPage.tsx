import { useAuth } from '@/contexts/AuthContext';
import { conversations, messages as allMessages, type Message } from '@/data/mockData';
import { ClientLayout } from '@/layouts/ClientLayout';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function ClientChatPage() {
  const { user } = useAuth();
  const myConvo = conversations.find(c => c.clientId === user?.id);
  const [msgs, setMsgs] = useState<Message[]>(
    myConvo ? allMessages.filter(m => m.conversationId === myConvo.id) : []
  );
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const sendMessage = () => {
    if (!input.trim() || !myConvo) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      conversationId: myConvo.id,
      senderId: user!.id,
      senderName: user!.fullName,
      senderRole: 'client',
      content: input,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMsgs(prev => [...prev, newMsg]);
    allMessages.push(newMsg);
    setInput('');

    // Simulate admin reply
    setTimeout(() => {
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        conversationId: myConvo.id,
        senderId: 'u1',
        senderName: 'Mohamed Bennani',
        senderRole: 'admin',
        content: 'Merci pour votre message. Nous allons vous répondre dans les plus brefs délais.',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setMsgs(prev => [...prev, reply]);
      allMessages.push(reply);
    }, 2000);
  };

  return (
    <ClientLayout>
      <div className="flex flex-col h-[calc(100vh-130px)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Messagerie</h1>
            <p className="text-sm text-muted-foreground">Discussion avec l'équipe 24/7 Logistics</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 space-y-4">
          {msgs.map(m => {
            const isMine = m.senderId === user?.id;
            const date = new Date(m.createdAt);
            return (
              <div key={m.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[70%] rounded-2xl px-4 py-2.5', isMine ? 'bg-accent text-accent-foreground rounded-br-md' : 'bg-muted text-card-foreground rounded-bl-md')}>
                  <p className="text-xs font-medium opacity-70 mb-1">{m.senderName}</p>
                  <p className="text-sm">{m.content}</p>
                  <p className="text-[10px] opacity-50 mt-1">{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
          {!myConvo && <p className="text-center text-muted-foreground">Aucune conversation. Envoyez votre premier message !</p>}
        </div>

        {/* Input */}
        <div className="flex gap-3 mt-4">
          <Button variant="outline" size="icon"><Paperclip className="h-4 w-4" /></Button>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Écrire un message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
}

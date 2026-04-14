import { useAuth } from '@/contexts/AuthContext';
import { useMyConversation, useMessages, useSendMessage, useCreateConversation } from '@/hooks/useSupabaseData';
import { ClientLayout } from '@/layouts/ClientLayout';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function ClientChatPage() {
  const { user } = useAuth();
  const { data: myConvo } = useMyConversation();
  const { data: msgs = [] } = useMessages(myConvo?.id);
  const sendMessage = useSendMessage();
  const createConversation = useCreateConversation();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    let convoId = myConvo?.id;
    if (!convoId) {
      const newConvo = await createConversation.mutateAsync(user.id);
      convoId = newConvo.id;
    }
    await sendMessage.mutateAsync({
      conversation_id: convoId,
      sender_id: user.id,
      content: input,
    });
    setInput('');
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

        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 space-y-4">
          {msgs.map(m => {
            const isMine = m.sender_id === user?.id;
            const date = new Date(m.created_at);
            return (
              <div key={m.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[70%] rounded-2xl px-4 py-2.5', isMine ? 'bg-accent text-accent-foreground rounded-br-md' : 'bg-muted text-card-foreground rounded-bl-md')}>
                  <p className="text-sm">{m.content}</p>
                  <p className="text-[10px] opacity-50 mt-1">{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
          {msgs.length === 0 && <p className="text-center text-muted-foreground">Aucune conversation. Envoyez votre premier message !</p>}
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" size="icon"><Paperclip className="h-4 w-4" /></Button>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Écrire un message..."
            className="flex-1"
          />
          <Button onClick={handleSend} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={sendMessage.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
}

import { useAuth } from '@/contexts/AuthContext';
import { useAllConversations, useMessages, useSendMessage } from '@/hooks/useSupabaseData';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function AdminChatPage() {
  const { user } = useAuth();
  const { data: conversations = [] } = useAllConversations();
  const [selectedConvo, setSelectedConvo] = useState<string>('');
  const convoId = selectedConvo || conversations[0]?.id || '';
  const { data: msgs = [] } = useMessages(convoId);
  const sendMessage = useSendMessage();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, convoId]);

  const handleSend = async () => {
    if (!input.trim() || !convoId || !user) return;
    await sendMessage.mutateAsync({ conversation_id: convoId, sender_id: user.id, content: input });
    setInput('');
  };

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-130px)] gap-4">
        <div className="w-80 flex-shrink-0 rounded-xl border border-border bg-card overflow-y-auto flex flex-col">
          <div className="p-3 border-b border-border"><h3 className="font-heading font-semibold text-sm text-card-foreground">Conversations</h3></div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(c => (
              <div key={c.id} onClick={() => setSelectedConvo(c.id)} className={cn('flex items-center gap-3 p-3 cursor-pointer border-b border-border transition-colors', convoId === c.id ? 'bg-accent/5' : 'hover:bg-muted/50')}>
                <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-semibold flex-shrink-0">C</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{c.last_message || 'Nouvelle conversation'}</p>
                  {(c.unread_count || 0) > 0 && <span className="bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{c.unread_count}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card rounded-t-xl">
            {msgs.map(m => {
              const isAdmin = m.sender_id === user?.id;
              const date = new Date(m.created_at);
              return (
                <div key={m.id} className={cn('flex', isAdmin ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[70%] rounded-2xl px-4 py-2.5', isAdmin ? 'bg-accent text-accent-foreground rounded-br-md' : 'bg-muted text-card-foreground rounded-bl-md')}>
                    <p className="text-sm">{m.content}</p>
                    <p className="text-[10px] opacity-50 mt-1">{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-3 p-3 border-t border-border bg-card rounded-b-xl">
            <Button variant="outline" size="icon"><Paperclip className="h-4 w-4" /></Button>
            <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Écrire un message..." className="flex-1" />
            <Button onClick={handleSend} className="bg-accent text-accent-foreground hover:bg-accent/90"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

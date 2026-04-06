import { ManagerLayout } from '@/layouts/ManagerLayout';
import { conversations, messages as allMessages, type Message } from '@/data/mockData';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function ManagerChatPage() {
  const [selectedConvo, setSelectedConvo] = useState<string>(conversations[0]?.id || '');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const map: Record<string, Message[]> = {};
    conversations.forEach(c => {
      map[c.id] = allMessages.filter(m => m.conversationId === c.id);
    });
    return map;
  });
  const [input, setInput] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkMsg, setBulkMsg] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentMsgs = messagesMap[selectedConvo] || [];
  const currentConvo = conversations.find(c => c.id === selectedConvo);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentMsgs, selectedConvo]);

  const sendMessage = () => {
    if (!input.trim() || !selectedConvo) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      conversationId: selectedConvo,
      senderId: 'u9',
      senderName: 'Youssef Trabelsi',
      senderRole: 'manager',
      content: input,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessagesMap(prev => ({
      ...prev,
      [selectedConvo]: [...(prev[selectedConvo] || []), newMsg],
    }));
    allMessages.push(newMsg);
    setInput('');
  };

  const sendBulkMessage = () => {
    if (!bulkMsg.trim()) return;
    const now = new Date().toISOString();
    conversations.forEach(c => {
      const newMsg: Message = {
        id: `m${Date.now()}-${Math.random()}`,
        conversationId: c.id,
        senderId: 'u9',
        senderName: 'Youssef Trabelsi',
        senderRole: 'manager',
        content: bulkMsg,
        read: false,
        createdAt: now,
      };
      setMessagesMap(prev => ({
        ...prev,
        [c.id]: [...(prev[c.id] || []), newMsg],
      }));
      allMessages.push(newMsg);
    });
    setBulkMsg('');
    setBulkOpen(false);
  };

  return (
    <ManagerLayout>
      <div className="flex h-[calc(100vh-130px)] gap-4">
        {/* Conversations list */}
        <div className="w-80 flex-shrink-0 rounded-xl border border-border bg-card overflow-y-auto flex flex-col">
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-sm text-card-foreground">Conversations</h3>
              <Button variant="ghost" size="sm" onClick={() => setBulkOpen(true)} title="Envoyer un message à tous">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
          {conversations.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedConvo(c.id)}
              className={cn(
                'flex items-center gap-3 p-3 cursor-pointer border-b border-border transition-colors',
                selectedConvo === c.id ? 'bg-accent/5' : 'hover:bg-muted/50'
              )}
            >
              <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-semibold flex-shrink-0">
                {c.clientName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-card-foreground">{c.clientName}</p>
                  {c.unreadCount > 0 && <span className="bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{c.unreadCount}</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {currentConvo && (
            <div className="p-3 border-b border-border bg-card rounded-t-xl">
              <p className="font-heading font-semibold text-card-foreground">{currentConvo.clientName}</p>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card">
            {currentMsgs.map(m => {
              const isManager = m.senderRole === 'manager';
              const date = new Date(m.createdAt);
              return (
                <div key={m.id} className={cn('flex', isManager ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[70%] rounded-2xl px-4 py-2.5', isManager ? 'bg-accent text-accent-foreground rounded-br-md' : 'bg-muted text-card-foreground rounded-bl-md')}>
                    <p className="text-xs font-medium opacity-70 mb-1">{m.senderName}</p>
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

        {/* Bulk Message Dialog */}
        <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Envoyer un message à tous les clients</DialogTitle>
              <DialogDescription>
                Ce message sera envoyé à {conversations.length} clients.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <textarea
                value={bulkMsg}
                onChange={e => setBulkMsg(e.target.value)}
                placeholder="Écrivez votre message ici..."
                className="w-full h-32 p-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="text-sm text-muted-foreground">
                {bulkMsg.length} caractères
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkOpen(false)}>Annuler</Button>
              <Button onClick={sendBulkMessage} disabled={!bulkMsg.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Envoyer à tous
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ManagerLayout>
  );
}

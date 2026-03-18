import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import type { ClassMessage } from "../../types";

interface CommunicationViewProps {
  classId: string;
  senderName: string;
  senderRole: string;
}

export default function CommunicationView({
  classId,
  senderName,
  senderRole,
}: CommunicationViewProps) {
  const {
    currentSchoolId,
    noticesList,
    classMessagesList,
    setClassMessagesList,
  } = useApp();

  const [newMessage, setNewMessage] = useState("");

  const schoolNotices = noticesList.filter(
    (n) => n.schoolId === currentSchoolId,
  );
  const rootMessages = classMessagesList.filter(
    (m) =>
      m.schoolId === currentSchoolId &&
      m.classId === classId &&
      !m.parentMessageId,
  );
  const getReplies = (parentId: string) =>
    classMessagesList.filter((m) => m.parentMessageId === parentId);

  const handleSend = (parentMessageId?: string) => {
    if (!newMessage.trim()) return;
    const msg: ClassMessage = {
      id: `cm${Date.now()}`,
      schoolId: currentSchoolId,
      classId,
      senderName,
      senderRole,
      content: newMessage.trim(),
      sentAt: new Date().toISOString(),
      parentMessageId,
    };
    setClassMessagesList([...classMessagesList, msg]);
    setNewMessage("");
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Communication</h2>
        <p className="text-muted-foreground">Notices and class messages</p>
      </div>

      <Tabs defaultValue="notices">
        <TabsList data-ocid="communication.tab">
          <TabsTrigger value="notices" data-ocid="communication.notices.tab">
            Notices
          </TabsTrigger>
          <TabsTrigger value="messages" data-ocid="communication.messages.tab">
            Class Messages
          </TabsTrigger>
        </TabsList>

        {/* NOTICES */}
        <TabsContent value="notices" className="mt-4 space-y-3">
          {schoolNotices.length === 0 ? (
            <Card data-ocid="notice.empty_state">
              <CardContent className="pt-8 pb-8 text-center">
                <MessageSquare
                  size={32}
                  className="mx-auto text-muted-foreground mb-2"
                />
                <p className="text-muted-foreground">
                  No notices at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            schoolNotices.map((notice, i) => (
              <Card
                key={notice.id}
                data-ocid={`notice.item.${i + 1}`}
                className={
                  notice.priority === "urgent" ? "border-destructive" : ""
                }
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{notice.title}</span>
                        <Badge
                          variant={
                            notice.priority === "urgent"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {notice.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notice.content}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Posted by{" "}
                        <span className="font-medium">{notice.postedBy}</span>{" "}
                        on {notice.postedAt}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* CLASS MESSAGES */}
        <TabsContent value="messages" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Class Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-72 pr-3">
                {rootMessages.length === 0 ? (
                  <div
                    className="text-center text-muted-foreground py-8"
                    data-ocid="classmsg.empty_state"
                  >
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rootMessages.map((msg, i) => (
                      <div key={msg.id} data-ocid={`classmsg.item.${i + 1}`}>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {msg.senderName}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {msg.senderRole}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatTime(msg.sentAt)}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        {getReplies(msg.id).map((reply) => (
                          <div
                            key={reply.id}
                            className="ml-6 mt-2 bg-accent/50 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {reply.senderName}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {reply.senderRole}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {formatTime(reply.sentAt)}
                              </span>
                            </div>
                            <p className="text-sm">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Type a message or reply..."
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  data-ocid="classmsg.textarea"
                />
                <Button
                  onClick={() =>
                    handleSend(rootMessages[rootMessages.length - 1]?.id)
                  }
                  className="self-end"
                  data-ocid="classmsg.primary_button"
                >
                  <Send size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

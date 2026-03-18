import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus, Send } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import type { ClassMessage, Notice } from "../../types";

export default function CommunicationModule() {
  const {
    currentSchoolId,
    classes,
    noticesList,
    setNoticesList,
    classMessagesList,
    setClassMessagesList,
    userProfile,
  } = useApp();

  const [noticeDialogOpen, setNoticeDialogOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticePriority, setNoticePriority] = useState<"normal" | "urgent">(
    "normal",
  );

  const myClasses = classes.filter((c) => c.schoolId === currentSchoolId);
  const [selectedClassId, setSelectedClassId] = useState(
    myClasses[0]?.id ?? "",
  );
  const [newMessage, setNewMessage] = useState("");

  const schoolNotices = noticesList.filter(
    (n) => n.schoolId === currentSchoolId,
  );
  const classThreads = classMessagesList.filter(
    (m) =>
      m.schoolId === currentSchoolId &&
      m.classId === selectedClassId &&
      !m.parentMessageId,
  );
  const getReplies = (parentId: string) =>
    classMessagesList.filter((m) => m.parentMessageId === parentId);

  const handleAddNotice = () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    const newNotice: Notice = {
      id: `n${Date.now()}`,
      schoolId: currentSchoolId,
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      postedBy: userProfile?.name ?? "Admin",
      postedAt: new Date().toISOString().split("T")[0],
      priority: noticePriority,
    };
    setNoticesList([newNotice, ...noticesList]);
    setNoticeTitle("");
    setNoticeContent("");
    setNoticePriority("normal");
    setNoticeDialogOpen(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedClassId) return;
    const msg: ClassMessage = {
      id: `cm${Date.now()}`,
      schoolId: currentSchoolId,
      classId: selectedClassId,
      senderName: userProfile?.name ?? "Admin",
      senderRole: "admin",
      content: newMessage.trim(),
      sentAt: new Date().toISOString(),
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
        <p className="text-muted-foreground">
          Manage notices and class messages
        </p>
      </div>

      <Tabs defaultValue="notices">
        <TabsList data-ocid="communication.tab">
          <TabsTrigger value="notices" data-ocid="communication.notices.tab">
            Notice Board
          </TabsTrigger>
          <TabsTrigger value="messages" data-ocid="communication.messages.tab">
            Class Messages
          </TabsTrigger>
        </TabsList>

        {/* NOTICE BOARD */}
        <TabsContent value="notices" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">School Notices</h3>
            <Dialog open={noticeDialogOpen} onOpenChange={setNoticeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-ocid="notice.open_modal_button">
                  <Plus size={16} className="mr-1" /> New Notice
                </Button>
              </DialogTrigger>
              <DialogContent data-ocid="notice.dialog">
                <DialogHeader>
                  <DialogTitle>Add New Notice</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="notice-title">Title</Label>
                    <Input
                      id="notice-title"
                      placeholder="Notice title"
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      data-ocid="notice.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notice-content">Content</Label>
                    <Textarea
                      id="notice-content"
                      placeholder="Notice content..."
                      rows={4}
                      value={noticeContent}
                      onChange={(e) => setNoticeContent(e.target.value)}
                      data-ocid="notice.textarea"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Select
                      value={noticePriority}
                      onValueChange={(v) =>
                        setNoticePriority(v as "normal" | "urgent")
                      }
                    >
                      <SelectTrigger data-ocid="notice.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setNoticeDialogOpen(false)}
                    data-ocid="notice.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNotice}
                    data-ocid="notice.submit_button"
                  >
                    Post Notice
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {schoolNotices.length === 0 ? (
            <Card data-ocid="notice.empty_state">
              <CardContent className="pt-8 pb-8 text-center">
                <MessageSquare
                  size={32}
                  className="mx-auto text-muted-foreground mb-2"
                />
                <p className="text-muted-foreground">
                  No notices yet. Create the first one.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {schoolNotices.map((notice, i) => (
                <Card
                  key={notice.id}
                  data-ocid={`notice.item.${i + 1}`}
                  className={
                    notice.priority === "urgent" ? "border-destructive" : ""
                  }
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
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
              ))}
            </div>
          )}
        </TabsContent>

        {/* CLASS MESSAGES */}
        <TabsContent value="messages" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Label>Select Class</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-48" data-ocid="classmsg.select">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {myClasses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {myClasses.find((c) => c.id === selectedClassId)?.name ??
                  "Class"}{" "}
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-72 pr-3">
                {classThreads.length === 0 ? (
                  <div
                    className="text-center text-muted-foreground py-8"
                    data-ocid="classmsg.empty_state"
                  >
                    No messages yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {classThreads.map((msg, i) => (
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
                        {/* Replies */}
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
                  placeholder="Type a message..."
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  data-ocid="classmsg.textarea"
                />
                <Button
                  onClick={handleSendMessage}
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

"use client";
import React, { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import ResponseTab from "@/components/core/response-tab";
import RequestTab from "@/components/core/request-tab";
import { useResStore } from "@/store/useResStore";
import { useReqStore } from "@/store/useReqStore";
import { validateUrl } from "@/lib/helper";
import { useLoadingStore } from "@/store/useLoadingStore";
import { httpStatusMap } from "@/lib/status-codes";
import { Send } from "lucide-react";

const Dashboard = () => {
  const [disabled, setDisabled] = useState<boolean>(false);
  const [method, setMethod] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  
  const { setData, setHeaders, setCookies, setStatus, status } = useResStore();
  const { params, headers: reqHeaders, bodyType, jsonBody, formDataFields } = useReqStore();
  const { setIsLoading } = useLoadingStore();

  const urlWithParams = useMemo(() => {
    if (!url.trim()) return url;
    
    const enabledParams = params.filter(p => p.enabled && p.key);
    if (enabledParams.length === 0) return url;
    
    const searchParams = new URLSearchParams();
    enabledParams.forEach(param => {
      searchParams.append(param.key, param.value);
    });
    
    return `${url}${url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
  }, [url, params]);

  const isValidUrl = useMemo(() => {
    if (!url.trim()) return false;
    
    if (validateUrl(url)) return true;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return validateUrl(`https://${url}`);
    }
    
    return false;
  }, [url]);

  const isFormValid = useMemo(() => {
    return method.trim() !== "" && isValidUrl;
  }, [method, isValidUrl]);

  const handleRequest = async () => {
    if (!isFormValid) return;
    
    setDisabled(true);
    setIsLoading(true);
    setStatus(0);
    setData(null);
    setHeaders(null);
    setCookies(null);
    
    try {
      const requestUrl = urlWithParams;
      
      const requestHeaders: Record<string, string> = {};
      reqHeaders.filter(h => h.enabled && h.key).forEach(header => {
        requestHeaders[header.key] = header.value;
      });
      
      let parsedBody = null;
      if (bodyType !== 'none' && ['POST', 'PUT', 'PATCH'].includes(method)) {
        if (bodyType === 'json' && jsonBody) {
          try {
            parsedBody = JSON.parse(jsonBody);
          } catch {
            parsedBody = jsonBody;
          }
        } else if (bodyType === 'form-data') {
          const formData: Record<string, string> = {};
          formDataFields.filter(f => f.enabled && f.key).forEach(field => {
            formData[field.key] = field.value;
          });
          parsedBody = formData;
          
          if (!requestHeaders['Content-Type']) {
            requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
          }
        }
      }
      
      const response = await axios.post('/api/proxy', {
        method,
        url: requestUrl,
        headers: requestHeaders,
        body: parsedBody
      });
      console.log(response.data);
      setData(response.data.data);
      setHeaders(response.data.headers);
      setCookies(response.data.cookies || {});
      setStatus(response.data.status);
      
    } catch (err: unknown) {
      console.log('error>>>', err);
      
      const axiosError = err as { response?: { data?: { status?: number; headers?: Record<string, string>; cookies?: Record<string, string>; error?: string; data?: unknown }; status?: number }; message?: string };
      
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        setStatus(errorData.status || axiosError.response.status || 0);
        setHeaders(errorData.headers || {});
        setCookies(errorData.cookies || {});
        setData(errorData.error || errorData.data || 'Request failed');
      } else {
        setStatus(0);
        setHeaders({});
        setCookies({});
        setData(axiosError.message || 'Network error occurred');
      }
      
    } finally {
      setDisabled(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-2 md:px-8 md:py-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-card rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={method} onValueChange={(value) => setMethod(value)}>
              <SelectTrigger className={`w-full sm:w-[120px] bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground transition-colors font-semibold ${
                !method ? 'border-red-300' : ''
              }`}>
                <SelectValue placeholder="Method" className="text-foreground" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectGroup className="font-semibold">
                  <SelectItem
                    value="GET"
                    className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    GET
                  </SelectItem>
                  <SelectItem
                    value="POST"
                    className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    POST
                  </SelectItem>
                  <SelectItem
                    value="PUT"
                    className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    PUT
                  </SelectItem>
                  <SelectItem
                    value="DELETE"
                    className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    DELETE
                  </SelectItem>
                  <SelectItem
                    value="PATCH"
                    className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    PATCH
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Input
                placeholder="Enter URL (e.g., https://api.github.com/users, localhost:3000)"
                type="text"
                className={`bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                  url && !isValidUrl ? 'border-red-300 focus:border-red-300' : ''
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRequest();
                  }
                }}
                value={urlWithParams}
                onChange={(e) => {
                  const newValue = e.target.value;
                  const questionMarkIndex = newValue.indexOf('?');
                  if (questionMarkIndex !== -1) {
                    setUrl(newValue.substring(0, questionMarkIndex));
                  } else {
                    setUrl(newValue);
                  }
                }}
              />
              {url && !isValidUrl && (
                <p className="absolute -bottom-5 left-0 text-xs text-red-500">
                  Enter a valid URL with domain (e.g., example.com, localhost:3000)
                </p>
              )}
            </div>
            <Button
              variant="gradient"
              onClick={handleRequest}
              disabled={disabled || !isFormValid}
              className={`transition-all duration-200 ${
                !isFormValid 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:opacity-90'
              }`}
            >
              Send
              <Send className={disabled ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border h-[calc(100vh-11rem)] overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="flex flex-col h-full ">
                <div className="p-4 border-b h-[53px]">
                  <h2 className="text-sm font-semibold uppercase">Request</h2>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <RequestTab />
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between h-[53px]">
                  <h2 className="text-sm font-semibold uppercase">Response</h2>
                  {status !== 0 && (
                    <Badge className={`${httpStatusMap[status].color} font-medium`}>
                      {status} {httpStatusMap[status].message}
                    </Badge>
                  )}
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <ResponseTab />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
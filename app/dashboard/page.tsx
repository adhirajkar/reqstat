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
import { Send, X, Lock } from "lucide-react";

const Dashboard = () => {
  const [disabled, setDisabled] = useState<boolean>(false);
  const [method, setMethod] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  
  const { setData, setHeaders, setCookies, setStatus, status, setDuration, setSize, duration, size } = useResStore();
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


  const clearUrl = () => {
    setUrl('');
  };

  const handleRequest = async () => {
    if (!isFormValid) return;

    setDisabled(true);
    setIsLoading(true);
    setStatus(0);
    setData(null);
    setHeaders(null);
    setCookies(null);
    setDuration(null);
    setSize(null);

    const startTime = performance.now();

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
          const hasFiles = formDataFields.some(f => f.enabled && f.type === 'file' && f.file);

          if (hasFiles) {
            // Convert files to base64 for transmission through proxy
            const formDataWithFiles: Array<{ key: string; value: string; type: 'text' | 'file'; fileName?: string; fileType?: string }> = [];

            for (const field of formDataFields.filter(f => f.enabled && f.key)) {
              if (field.type === 'file' && field.file) {
                // Convert file to base64
                const base64 = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64String = reader.result as string;
                    resolve(base64String.split(',')[1]); // Remove data:mime;base64, prefix
                  };
                  reader.readAsDataURL(field.file!);
                });

                formDataWithFiles.push({
                  key: field.key,
                  value: base64,
                  type: 'file',
                  fileName: field.file.name,
                  fileType: field.file.type
                });
              } else {
                formDataWithFiles.push({
                  key: field.key,
                  value: field.value,
                  type: 'text'
                });
              }
            }

            parsedBody = { __formData: formDataWithFiles };
            requestHeaders['Content-Type'] = 'multipart/form-data';
          } else {
            // Use regular object for non-file form data
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
      }

      const response = await axios.post('/api/proxy', {
        method,
        url: requestUrl,
        headers: requestHeaders,
        body: parsedBody
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      // Calculate response size
      const responseData = response.data.data;
      const responseSize = new Blob([
        typeof responseData === 'string'
          ? responseData
          : JSON.stringify(responseData)
      ]).size;

      console.log(response.data);
      setData(responseData);
      setHeaders(response.data.headers);
      setCookies(response.data.cookies || {});
      setStatus(response.data.status);
      setDuration(duration);
      setSize(responseSize);
      
    } catch (err: unknown) {
      console.log('error>>>', err);

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setDuration(duration);

      const axiosError = err as { response?: { data?: { status?: number; headers?: Record<string, string>; cookies?: Record<string, string>; error?: string; data?: unknown }; status?: number }; message?: string };

      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        setStatus(errorData.status || axiosError.response.status || 0);
        setHeaders(errorData.headers || {});
        setCookies(errorData.cookies || {});
        const errorMessage = errorData.error || errorData.data || 'Request failed';
        setData(errorMessage);

        // Calculate error response size
        const errorSize = new Blob([
          typeof errorMessage === 'string'
            ? errorMessage
            : JSON.stringify(errorMessage)
        ]).size;
        setSize(errorSize);
      } else {
        setStatus(0);
        setHeaders({});
        setCookies({});
        const errorMessage = axiosError.message || 'Network error occurred';
        setData(errorMessage);

        // Calculate error response size
        const errorSize = new Blob([errorMessage]).size;
        setSize(errorSize);
      }
      
    } finally {
      setDisabled(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-2 md:px-8 md:py-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-card rounded-lg border shadow-sm p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch">
            <Select value={method} onValueChange={(value) => setMethod(value)}>
              <SelectTrigger className={`w-full lg:w-[130px] min-h-[44px] bg-background border-2 transition-all duration-200 font-semibold ${
                !method ? 'border-red-300 text-muted-foreground' : 'border-input'
              }`}>
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="GET" className="font-medium cursor-pointer">
                    GET
                  </SelectItem>
                  <SelectItem value="POST" className="font-medium cursor-pointer">
                    POST
                  </SelectItem>
                  <SelectItem value="PUT" className="font-medium cursor-pointer">
                    PUT
                  </SelectItem>
                  <SelectItem value="DELETE" className="font-medium cursor-pointer">
                    DELETE
                  </SelectItem>
                  <SelectItem value="PATCH" className="font-medium cursor-pointer">
                    PATCH
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <div className="relative">
                {urlWithParams.startsWith('https://') && (
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                )}
                <Input
                  placeholder="Enter URL (e.g., https://api.github.com/users)"
                  type="text"
                  className={`min-h-[44px] ${urlWithParams.startsWith('https://') ? 'pl-10' : ''} ${url ? 'pr-10' : ''} bg-background border-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
                    url && !isValidUrl ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-input'
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
                {url && (
                  <button
                    onClick={clearUrl}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {url && !isValidUrl && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                  Enter a valid URL with domain
                </p>
              )}
              {isValidUrl && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Press <kbd className="px-1 py-0.5 text-xs font-semibold bg-muted border rounded">Enter</kbd> to send
                </p>
              )}
            </div>
            <Button
              variant="gradient"
              onClick={handleRequest}
              disabled={disabled || !isFormValid}
              className={`w-full lg:w-auto min-h-[44px] px-6 font-semibold whitespace-nowrap ${
                !isFormValid
                  ? 'opacity-40 cursor-not-allowed'
                  : disabled
                  ? 'opacity-70'
                  : 'hover:scale-105'
              }`}
            >
              {disabled ? (
                <div className="flex items-center gap-2 relative">
                  <span>Sending</span>
                  <Send className="h-4 w-4 animate-[fly_1s_ease-in-out_infinite]" style={{
                    animation: 'fly 1s ease-in-out infinite',
                  }} />
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
            <style jsx>{`
              @keyframes fly {
                0% {
                  transform: translateX(-20px);
                  opacity: 0.3;
                }
                50% {
                  transform: translateX(10px);
                  opacity: 1;
                }
                100% {
                  transform: translateX(-20px);
                  opacity: 0.3;
                }
              }
            `}</style>
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
                    <div className="flex items-center gap-2">
                      <Badge className={`${httpStatusMap[status].color} font-medium`}>
                        {status} {httpStatusMap[status].message}
                      </Badge>
                      {duration !== null && (
                        <Badge variant="secondary" className="font-mono text-xs">
                          {duration}ms
                        </Badge>
                      )}
                      {size !== null && (
                        <Badge variant="secondary" className="font-mono text-xs">
                          {size < 1024 ? `${size}B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(2)}KB` : `${(size / (1024 * 1024)).toFixed(2)}MB`}
                        </Badge>
                      )}
                    </div>
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
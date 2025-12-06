import React, { memo, useMemo } from 'react'
import { useResStore } from '@/store/useResStore'
import JsonViewer from './json-viewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"
import { FileJson, Database, Cookie, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useLoadingStore } from '@/store/useLoadingStore'

const ResponseTab = memo(() => {
  const { data, headers, cookies, status } = useResStore();
  const { isLoading } = useLoadingStore();
  const [copied, setCopied] = React.useState(false);

  const contentType = useMemo(() =>
    headers?.['content-type'] || headers?.['Content-Type'] || '',
    [headers]
  );

  const isJson = useMemo(() => contentType.includes('application/json'), [contentType]);
  const isHtml = useMemo(() => contentType.includes('text/html'), [contentType]);

  const copyResponse = () => {
    const textToCopy = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const renderBody = () => {
    if (isJson) {
      return <JsonViewer value={data} />;
    } else if (isHtml) {
      // Strip out script tags and potentially harmful content
      const sanitizedHtml = data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<link[^>]*>/gi, '') // Remove link tags that might try to load external resources
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ''); // Remove style tags to prevent CSS conflicts
      
      return (
        <iframe 
          srcDoc={sanitizedHtml}
          className="w-full h-[300px] border-0 bg-background"
          sandbox="" // Empty sandbox - most restrictive, no permissions
          title="HTML Preview"
        />
      );
    } else {
      return <pre className="whitespace-pre-wrap font-mono text-sm">{data}</pre>;
    }
  };
  
  return (<>
  {isLoading ? (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
      <p className="text-sm text-muted-foreground">Sending request...</p>
    </div>
  ) : status === 0 ? (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileJson className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <p className="text-sm text-muted-foreground mb-1">No response yet</p>
      <p className="text-xs text-muted-foreground/70">Send a request to see the response</p>
    </div>
  ) : (
    <>
      <div className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {contentType && (
              <>
                <span className="text-xs text-muted-foreground">Content-Type:</span>
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{contentType}</span>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyResponse}
            className="h-7"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-2" />
                Copy Response
              </>
            )}
          </Button>
        </div>
      </div>
      <Tabs defaultValue="body" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger className='cursor-pointer flex items-center gap-2' value="body">
            <FileJson className="h-4 w-4" />
            Body
          </TabsTrigger>
          <TabsTrigger className='cursor-pointer flex items-center gap-2' value="headers">
            <Database className="h-4 w-4" />
            Headers
            {headers && Object.keys(headers).length > 0 && (
              <Badge
                className="ml-1 h-5 min-w-5 rounded-full px-1.5 font-mono tabular-nums"
                variant="secondary"
              >
                {Object.keys(headers).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger className='cursor-pointer flex items-center gap-2' value="cookies">
            <Cookie className="h-4 w-4" />
            Cookies
            {cookies && Object.keys(cookies).length > 0 && (
              <Badge
                className="ml-1 h-5 min-w-5 rounded-full px-1.5 font-mono tabular-nums"
                variant="secondary"
              >
                {Object.keys(cookies).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      <TabsContent value="body" className="h-[300px] overflow-hidden">
        {renderBody()}
      </TabsContent>
      <TabsContent value="headers" className="h-[300px] overflow-y-auto">
        {headers && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Header</th>
                <th className="text-left p-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(headers).map(([key, value]) => (
                <tr key={key} className="border-b hover:bg-accent/50">
                  <td className="p-2 font-mono text-sm">{key}</td>
                  <td className="p-2 text-sm break-all">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TabsContent>
      <TabsContent value="cookies" className="h-[300px] overflow-y-auto">
        {cookies && Object.keys(cookies).length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Name</th>
                <th className="text-left p-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(cookies).map(([name, value]) => (
                <tr key={name} className="border-b hover:bg-accent/50">
                  <td className="p-2 font-mono text-sm">{name}</td>
                  <td className="p-2 text-sm break-all">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No cookies received
          </div>
        )}
      </TabsContent>
      </Tabs>
    </>
  )}
  </>)
})

ResponseTab.displayName = 'ResponseTab'

export default ResponseTab
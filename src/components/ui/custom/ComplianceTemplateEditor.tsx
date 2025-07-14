import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Save,
  Eye
} from 'lucide-react';
import { complianceApi } from '@/services/compliance';

export function ComplianceTemplateEditor() {
  const [yamlContent, setYamlContent] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Example YAML template
  const exampleTemplate = `# SOC2 Type II Compliance Template
name: "SOC2 Type II"
version: "2017"
description: "Service Organization Control 2 Type II certification framework"

frameworks:
  - id: "soc2"
    name: "SOC2 Type II"
    category: "Security"
    version: "2017"
    description: "Security, availability, processing integrity, confidentiality, and privacy controls"

controls:
  - framework: "SOC2"
    controlId: "CC6.1"
    severity: "CRITICAL"
    description: "Only required ports should be open"
    category: "Access Control"
    subcategory: "Network Security"
    references:
      - "https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html"
    
  - framework: "SOC2"
    controlId: "CC6.2"
    severity: "HIGH"
    description: "Implement proper authentication mechanisms"
    category: "Access Control"
    subcategory: "Authentication"
    references:
      - "https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html"

metadata:
  author: "PGDN Security Team"
  created: "2025-01-15"
  tags:
    - "security"
    - "compliance"
    - "soc2"`;

  const validateYaml = async (content: string) => {
    setIsValidating(true);
    setValidationErrors([]);

    try {
      // Basic YAML validation (in a real app, you'd use a proper YAML parser)
      const errors: string[] = [];

      // Check for basic structure
      if (!content.includes('name:') || !content.includes('frameworks:') || !content.includes('controls:')) {
        errors.push('Template must include name, frameworks, and controls sections');
      }

      // Check for required control fields
      const controlSections = content.split('- framework:').slice(1);
      controlSections.forEach((section, index) => {
        if (!section.includes('controlId:') || !section.includes('description:')) {
          errors.push(`Control ${index + 1} is missing required fields (controlId, description)`);
        }
      });

      setValidationErrors(errors);

      // Try to parse as JSON for preview (simplified)
      if (errors.length === 0) {
        // This is a simplified preview - in reality you'd use a YAML parser
        const preview = {
          name: content.match(/name:\s*"([^"]+)"/)?.[1] || 'Unknown',
          version: content.match(/version:\s*"([^"]+)"/)?.[1] || 'Unknown',
          frameworks: content.match(/frameworks:/) ? 'Defined' : 'Missing',
          controls: controlSections.length,
          valid: errors.length === 0
        };
        setPreviewData(preview);
      } else {
        setPreviewData(null);
      }
    } catch (error) {
      setValidationErrors(['Failed to parse YAML content']);
      setPreviewData(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleYamlChange = (content: string) => {
    setYamlContent(content);
    if (content.trim()) {
      validateYaml(content);
    } else {
      setValidationErrors([]);
      setPreviewData(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await complianceApi.uploadTemplate(file);
      if (result.success) {
        // Read file content for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setYamlContent(content);
          validateYaml(content);
        };
        reader.readAsText(file);
      } else {
        setValidationErrors([result.message]);
      }
    } catch (error) {
      setValidationErrors(['Failed to upload template']);
    }
  };

  const handleExport = () => {
    if (!yamlContent.trim()) return;

    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-template-${new Date().toISOString().split('T')[0]}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setYamlContent(exampleTemplate);
    validateYaml(exampleTemplate);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Compliance Template Editor</h1>
          <p className="text-muted mt-1">Import, edit, and export compliance framework templates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadExample}>
            <FileText className="w-4 h-4 mr-2" />
            Load Example
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Template
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml"
        onChange={handleFileUpload}
        className="hidden"
      />

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>YAML Template</span>
                <div className="flex items-center gap-2">
                  {isValidating && <div className="text-sm text-muted">Validating...</div>}
                  {validationErrors.length === 0 && previewData && (
                    <Badge variant="default" className="bg-success text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid
                    </Badge>
                  )}
                  {validationErrors.length > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {validationErrors.length} errors
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
                             <Textarea
                 value={yamlContent}
                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleYamlChange(e.target.value)}
                 placeholder="Paste your YAML template here..."
                 className="min-h-[400px] font-mono text-sm"
               />
            </CardContent>
          </Card>

          {validationErrors.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Validation Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2">
            <Button 
              onClick={handleExport}
              disabled={!yamlContent.trim() || validationErrors.length > 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Template
            </Button>
            <Button 
              variant="outline"
              disabled={!yamlContent.trim() || validationErrors.length > 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {previewData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Template Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Template Name</Label>
                      <Input value={previewData.name} readOnly />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Version</Label>
                      <Input value={previewData.version} readOnly />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Frameworks</Label>
                      <Input value={previewData.frameworks} readOnly />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Controls</Label>
                      <Input value={previewData.controls} readOnly />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Validation Status</Label>
                      <div className="flex items-center gap-2 mt-2">
                        {previewData.valid ? (
                          <Badge variant="default" className="bg-success text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Valid Template
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Invalid Template
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Template Structure</Label>
                      <div className="bg-surface-secondary p-3 rounded text-sm mt-2">
                        <div className="space-y-1">
                          <div>✓ Name and version defined</div>
                          <div>✓ Frameworks section present</div>
                          <div>✓ Controls section with {previewData.controls} controls</div>
                          <div>✓ All required fields present</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32 text-muted">
                No template data to preview. Please enter valid YAML content in the editor.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 
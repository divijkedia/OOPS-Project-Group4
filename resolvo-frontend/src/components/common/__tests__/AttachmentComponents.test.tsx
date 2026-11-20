import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AttachmentViewer } from '../AttachmentViewer';
import { AttachmentInput } from '../AttachmentInput';

describe('AttachmentViewer & AttachmentInput Components', () => {
  it('renders image attachment in AttachmentViewer with fullscreen trigger', () => {
    const sampleData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    render(
      <AttachmentViewer
        attachmentName="error_screenshot.png"
        attachmentType="image/png"
        attachmentData={sampleData}
        label="Diagnostic Screenshot"
      />
    );

    expect(screen.getByText('Diagnostic Screenshot')).toBeInTheDocument();
    expect(screen.getAllByText('error_screenshot.png').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('View Fullscreen')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', sampleData);
  });

  it('renders non-image attachment file download card', () => {
    const logData = 'data:text/plain;base64,c3lzdGVtIGVycm9yIGF0IGxpbmUgNDI=';

    render(
      <AttachmentViewer
        attachmentName="server_dump.log"
        attachmentType="text/plain"
        attachmentData={logData}
      />
    );

    expect(screen.getByText('server_dump.log')).toBeInTheDocument();
    const downloadLink = screen.getByRole('link', { name: /download/i });
    expect(downloadLink).toHaveAttribute('href', logData);
    expect(downloadLink).toHaveAttribute('download', 'server_dump.log');
  });

  it('renders AttachmentInput button variant and allows removing staged attachment', () => {
    const onChange = vi.fn();
    const mockAttachment = {
      name: 'network-trace.png',
      type: 'image/png',
      data: 'data:image/png;base64,123',
      size: 1024,
    };

    render(
      <AttachmentInput
        attachment={mockAttachment}
        onChange={onChange}
        variant="button"
      />
    );

    expect(screen.getByText('network-trace.png')).toBeInTheDocument();
    expect(screen.getByText('1.0 KB')).toBeInTheDocument();

    const removeBtn = screen.getByTitle('Remove attachment');
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('renders AttachmentInput dropzone variant and shows prompt when empty', () => {
    const onChange = vi.fn();

    render(
      <AttachmentInput
        attachment={null}
        onChange={onChange}
        variant="dropzone"
        label="Attach Error Screenshot"
      />
    );

    expect(screen.getByText('Attach Error Screenshot')).toBeInTheDocument();
    expect(screen.getByText(/Click to browse or drag & drop/i)).toBeInTheDocument();
  });
});

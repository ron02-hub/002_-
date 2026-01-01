import { render, screen, fireEvent } from '@testing-library/react';
import { SDScale } from '@/components/survey/SDScale';

describe('SDScale', () => {
  it('renders correctly', () => {
    const onChange = jest.fn();
    render(
      <SDScale
        leftLabel="うるさい"
        rightLabel="静か"
        value={0}
        onChange={onChange}
      />
    );

    expect(screen.getByText('うるさい')).toBeInTheDocument();
    expect(screen.getByText('静か')).toBeInTheDocument();
  });

  it('calls onChange when slider value changes', () => {
    const onChange = jest.fn();
    render(
      <SDScale
        leftLabel="うるさい"
        rightLabel="静か"
        value={0}
        onChange={onChange}
      />
    );

    // スライダーの値変更をシミュレート
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '2' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('displays correct value label', () => {
    const onChange = jest.fn();
    render(
      <SDScale
        leftLabel="うるさい"
        rightLabel="静か"
        value={2}
        onChange={onChange}
      />
    );

    expect(screen.getByText('やや静か')).toBeInTheDocument();
  });
});


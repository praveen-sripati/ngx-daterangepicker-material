import {
  Directive,
  ViewContainerRef,
  ComponentFactoryResolver,
  ElementRef,
  HostListener,
  forwardRef,
  ChangeDetectorRef,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  DoCheck,
  KeyValueDiffer,
  KeyValueDiffers,
  Output,
  EventEmitter,
  Renderer2,
  HostBinding,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import {
  ConnectedPosition,
  HorizontalConnectionPos,
  Overlay,
  OverlayRef,
  PositionStrategy,
  ScrollDispatcher,
  VerticalConnectionPos
} from '@angular/cdk/overlay';
import { DaterangepickerComponent } from './daterangepicker.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _moment from 'moment';
import { LocaleConfig } from './daterangepicker.config';
import { LocaleService } from './locale.service';
import { ComponentPortal } from '@angular/cdk/portal';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
const moment = _moment;

@Directive({
  selector: 'input[ngxDaterangepickerMd]',
  host: {
    '(keyup.esc)': 'hide()',
    '(blur)': 'onBlur()',
    '(click)': 'open()',
    '(keyup)': 'inputChanged($event)'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DaterangepickerDirective), multi: true
    }
  ]
})
export class DaterangepickerDirective implements OnInit, OnChanges, DoCheck, OnDestroy {
  public picker: DaterangepickerComponent;
  public overlayPicker: DaterangepickerComponent;
  private datePickerPortal: ComponentPortal<DaterangepickerComponent>;
  private _onChange = Function.prototype;
  private _onTouched = Function.prototype;
  private _validatorChange = Function.prototype;
  private _disabled: boolean;
  private _value: any;
  private localeDiffer: KeyValueDiffer<string, any>;
  /** Emits when the component is destroyed. */
  private readonly _destroyed = new Subject<void>();

  /** CDK Overlay fields */
  overlayRef: OverlayRef | null;
  originX: HorizontalConnectionPos = 'start';
  originY: VerticalConnectionPos = 'bottom';
  overlayX: HorizontalConnectionPos = 'start';
  overlayY: VerticalConnectionPos = 'top';
  isFlexible = true;
  canPush = true;
  offsetX = 0;
  offsetY = 0;

  @Input()
  minDate: _moment.Moment
  @Input()
  maxDate: _moment.Moment
  @Input()
  autoApply: boolean;
  @Input()
  alwaysShowCalendars: boolean;
  @Input()
  showCustomRangeLabel: boolean;
  @Input()
  linkedCalendars: boolean;
  @Input()
  dateLimit: number = null;
  @Input()
  singleDatePicker: boolean;
  @Input()
  showWeekNumbers: boolean;
  @Input()
  showISOWeekNumbers: boolean;
  @Input()
  showDropdowns: boolean;
  @Input()
  isInvalidDate: Function;
  @Input()
  isCustomDate: Function;
  @Input()
  isTooltipDate: Function;
  @Input()
  showClearButton: boolean;
  @Input()
  customRangeDirection: boolean;
  @Input()
  ranges: any;
  @Input()
  opens: string;
  @Input()
  drops: string;
  firstMonthDayClass: string;
  @Input()
  lastMonthDayClass: string;
  @Input()
  emptyWeekRowClass: string;
  @Input()
  emptyWeekColumnClass: string;
  @Input()
  firstDayOfNextMonthClass: string;
  @Input()
  lastDayOfPreviousMonthClass: string;
  @Input()
  keepCalendarOpeningWithRange: boolean;
  @Input()
  showRangeLabelOnInput: boolean;
  @Input()
  showCancel: boolean = false;
  @Input()
  lockStartDate: boolean = false;
  // Overlay input
  @Input()
  ngxOverlay: boolean = false;
  // timepicker variables
  @Input()
  timePicker: Boolean = false;
  @Input()
  timePicker24Hour: Boolean = false;
  @Input()
  timePickerIncrement: number = 1;
  @Input()
  timePickerSeconds: Boolean = false;
  @Input() closeOnAutoApply = true;
  _locale: LocaleConfig = {};
  @Input() set locale(value) {
    this._locale = { ...this._localeService.config, ...value };
  }
  get locale(): any {
    return this._locale;
  }
  @Input()
  private _endKey: string = 'endDate';
  private _startKey: string = 'startDate';
  @Input() set startKey(value) {
    if (value !== null) {
      this._startKey = value;
    } else {
      this._startKey = 'startDate';
    }
  }
  @Input() set endKey(value) {
    if (value !== null) {
      this._endKey = value;
    } else {
      this._endKey = 'endDate';
    }
  }
  notForChangesProperty: Array<string> = [
    'locale',
    'endKey',
    'startKey'
  ];

  get value() {
    return this._value || null;
  }
  set value(val) {
    this._value = val;
    this._onChange(val);
    this._changeDetectorRef.markForCheck();
  }
  @Output('change') onChange: EventEmitter<Object> = new EventEmitter();
  @Output('rangeClicked') rangeClicked: EventEmitter<Object> = new EventEmitter();
  @Output('datesUpdated') datesUpdated: EventEmitter<Object> = new EventEmitter();
  @Output() startDateChanged: EventEmitter<Object> = new EventEmitter();
  @Output() endDateChanged: EventEmitter<Object> = new EventEmitter();
  @HostBinding('disabled') get disabled() { return this._disabled; }
  constructor(
    public viewContainerRef: ViewContainerRef,
    public _changeDetectorRef: ChangeDetectorRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _el: ElementRef,
    private _renderer: Renderer2,
    private differs: KeyValueDiffers,
    private _localeService: LocaleService,
    private elementRef: ElementRef,
    public overlay: Overlay,
    public dir: Directionality,
    private _scrollDispatcher: ScrollDispatcher,
    private _ngZone: NgZone,
  ) {
    this.drops = 'down';
    this.opens = 'auto';

    // Without CDK Overlay
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(DaterangepickerComponent);
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);
    this.picker = (<DaterangepickerComponent>componentRef.instance);
    this.picker.inline = false; // set inline to false for all directive usage

    // With CDK Overlay
    this.datePickerPortal = new ComponentPortal(DaterangepickerComponent, viewContainerRef, null, this._componentFactoryResolver);
    this.createOverlay();
    this.overlayPicker = this.overlayRef.attach(this.datePickerPortal).instance;
    const container = this.overlayPicker.pickerContainer.nativeElement;
    this.overlayPicker.inline = false;
    this._renderer.setStyle(container, 'display', 'none');
  }

  ngOnInit() {

    if (this.ngxOverlay) {
      this.picker = null;
      this.picker = this.overlayPicker;
      this.overlayPicker = null;
    }

    this.picker.startDateChanged.asObservable().subscribe((itemChanged: any) => {
      this.startDateChanged.emit(itemChanged);
    });
    this.picker.endDateChanged.asObservable().subscribe((itemChanged: any) => {
      this.endDateChanged.emit(itemChanged);
    });
    this.picker.rangeClicked.asObservable().subscribe((range: any) => {
      this.rangeClicked.emit(range);
    });
    this.picker.datesUpdated.asObservable().subscribe((range: any) => {
      this.datesUpdated.emit(range);
    });
    this.picker.choosedDate.asObservable().subscribe((change: any) => {
      if (change) {
        const value = {};
        value[this._startKey] = change.startDate;
        value[this._endKey] = change.endDate;
        this.value = value;
        this.onChange.emit(value);
        if (typeof change.chosenLabel === 'string') {
          this._el.nativeElement.value = change.chosenLabel;
        }
      }
    });
    this.picker.firstMonthDayClass = this.firstMonthDayClass;
    this.picker.lastMonthDayClass = this.lastMonthDayClass;
    this.picker.emptyWeekRowClass = this.emptyWeekRowClass;
    this.picker.emptyWeekColumnClass = this.emptyWeekColumnClass;
    this.picker.firstDayOfNextMonthClass = this.firstDayOfNextMonthClass;
    this.picker.lastDayOfPreviousMonthClass = this.lastDayOfPreviousMonthClass;
    this.picker.drops = this.drops;
    this.picker.opens = this.opens;
    this.localeDiffer = this.differs.find(this.locale).create();
    this.picker.closeOnAutoApply = this.closeOnAutoApply;
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const change in changes) {
      if (changes.hasOwnProperty(change)) {
        if (this.notForChangesProperty.indexOf(change) === -1) {
          if (this.ngxOverlay) {
            this.overlayPicker[change] = changes[change].currentValue;
          } else {
            this.picker[change] = changes[change].currentValue;
          }
        }
      }
    }
  }

  ngDoCheck() {
    if (this.localeDiffer) {
      const changes = this.localeDiffer.diff(this.locale);
      if (changes) {
        this.picker.updateLocale(this.locale);
      }
    }
  }

  ngOnDestroy() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this._destroyed.next();
    this._destroyed.complete();
  }

  onBlur() {
    this._onTouched();
  }

  open(event?: any) {
    if (this.disabled) {
      return;
    }
    this.picker.show(event);
    if (this.ngxOverlay) {
      let style = {
        display: 'unset',
        position: 'absolute'
      }
      this._renderer.setStyle(this.picker.pickerContainer.nativeElement, 'position', style.position);
      this._renderer.setStyle(this.picker.pickerContainer.nativeElement, 'display', style.display);
    } else {
      setTimeout(() => {
        this.setPosition();
      });
    }
  }

  hide(e?) {
    this.picker.hide(e);
    if (this.ngxOverlay) {
      this._renderer.setStyle(this.picker.pickerContainer.nativeElement, 'display', 'none');
    }
  }

  toggle(e?) {
    if (this.picker.isShown) {
      this.hide(e);
    } else {
      this.open(e);
    }
  }

  clear() {
    this.picker.clear();
  }

  writeValue(value) {
    this.setValue(value);
  }
  registerOnChange(fn) {
    this._onChange = fn;
  }
  registerOnTouched(fn) {
    this._onTouched = fn;
  }
  setDisabledState(state: boolean): void {
    this._disabled = state;
  }
  private setValue(val: any) {
    if (val) {
      this.value = val;
      if (val[this._startKey]) {
        this.picker.setStartDate(val[this._startKey]);
      }
      if (val[this._endKey]) {
        this.picker.setEndDate(val[this._endKey]);
      }
      this.picker.calculateChosenLabel();
      if (this.picker.chosenLabel) {
        this._el.nativeElement.value = this.picker.chosenLabel;
      }
    } else {
      this.picker.clear();
    }
  }
  /**
   * Set position of the calendar
   */
  setPosition() {
    let style;
    let containerTop;
    const container = this.picker.pickerContainer.nativeElement;
    const element = this._el.nativeElement;
    if (this.drops && this.drops === 'up') {
      containerTop = (element.offsetTop - container.clientHeight) + 'px';
    } else {
      containerTop = 'auto';
    }
    if (this.opens === 'left') {
      style = {
        top: containerTop,
        left: (element.offsetLeft - container.clientWidth + element.clientWidth) + 'px',
        right: 'auto'
      };
    } else if (this.opens === 'center') {
      style = {
        top: containerTop,
        left: (element.offsetLeft + element.clientWidth / 2
          - container.clientWidth / 2) + 'px',
        right: 'auto'
      };
    } else if (this.opens === 'right') {
      style = {
        top: containerTop,
        left: element.offsetLeft + 'px',
        right: 'auto'
      };
    } else {
      const position = element.offsetLeft + element.clientWidth / 2 - container.clientWidth / 2;
      if (position < 0) {
        style = {
          top: containerTop,
          left: element.offsetLeft + 'px',
          right: 'auto'
        };
      }
      else {
        style = {
          top: containerTop,
          left: position + 'px',
          right: 'auto'
        };
      }
    }
    if (style) {
      this._renderer.setStyle(container, 'top', style.top);
      this._renderer.setStyle(container, 'left', style.left);
      this._renderer.setStyle(container, 'right', style.right);
    }
  }
  inputChanged(e) {
    if (e.target.tagName.toLowerCase() !== 'input') {
      return;
    }
    if (!e.target.value.length) {
      return;
    }
    const dateString = e.target.value.split(this.picker.locale.separator);
    let start = null, end = null;
    if (dateString.length === 2) {
      start = moment(dateString[0], this.picker.locale.format);
      end = moment(dateString[1], this.picker.locale.format);
    }
    if (this.singleDatePicker || start === null || end === null) {
      start = moment(e.target.value, this.picker.locale.format);
      end = start;
    }
    if (!start.isValid() || !end.isValid()) {
      return;
    }
    this.picker.setStartDate(start);
    this.picker.setEndDate(end);
    this.picker.updateView();

  }
  /**
   * For click outside of the calendar's container
   * @param event event object
   */
  @HostListener('document:click', ['$event'])
  outsideClick(event): void {
    if (!event.target) {
      return;
    }

    if (event.target.classList.contains('ngx-daterangepicker-action')) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.hide();
    }

  }

  createOverlay() {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.getOverlayPosition(),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      direction: this.dir.value,
    });
  }

  getOverlayPosition(): PositionStrategy {
    const defaultPositionList: ConnectedPosition[] = [{
      originX: this.originX,
      originY: this.originY,
      overlayX: this.overlayX,
      overlayY: this.overlayY,
      offsetX: this.offsetX,
      offsetY: this.offsetY
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
    },
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    }
    ];

    let scrollableAncestors =
      this._scrollDispatcher.getAncestorScrollContainers(this.elementRef);

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.elementRef)
      .withFlexibleDimensions(this.isFlexible)
      .withPush(this.canPush)
      .withViewportMargin(10)
      .withGrowAfterOpen(true)
      .withPositions(defaultPositionList)
      .withScrollableContainers(scrollableAncestors);

    positionStrategy.positionChanges.pipe(takeUntil(this._destroyed)).subscribe(change => {
      if (this.picker) {
        if (scrollableAncestors.length === 0) {
          // Update registered scrollables
          scrollableAncestors = this._scrollDispatcher.getAncestorScrollContainers(this.elementRef);
          positionStrategy.withScrollableContainers(scrollableAncestors);
        }
        if (change.scrollableViewProperties.isOverlayClipped) {
          // After position changes occur and the overlay is clipped by
          // a parent scrollable then close the picker.
          this._ngZone.run(() => this.hide());
        } else if (!change.scrollableViewProperties.isOverlayClipped && (this.elementRef.nativeElement === document.activeElement)) {
          // After position changes occur and the overlay is clipped is not clipped by
          // a parent scrollable then open the picker.
          this._ngZone.run(() => this.open());
        }
      }
    });

    return positionStrategy;
  }

}
